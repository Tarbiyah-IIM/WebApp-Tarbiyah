import crypto from 'node:crypto';
import { pool, withTransaction } from '../config/db.js';

export async function createOrder({ userId, courseIds = [], orderType = 'course', paymentMethod = 'sandbox_card' }) {
  return withTransaction(async (conn) => {
    const orderCode = `MK-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    if (orderType === 'subscription') {
      const [settingRows] = await conn.execute(
        "SELECT setting_value FROM site_settings WHERE setting_key IN ('premium_price', 'premium_currency')"
      );
      const priceRow = await conn.execute(
        "SELECT setting_value FROM site_settings WHERE setting_key = 'premium_price' LIMIT 1"
      );
      const currencyRow = await conn.execute(
        "SELECT setting_value FROM site_settings WHERE setting_key = 'premium_currency' LIMIT 1"
      );
      const price = Number(priceRow[0][0]?.setting_value || 160);
      const currency = currencyRow[0][0]?.setting_value || 'USD';
      void settingRows;

      const [orderRes] = await conn.execute(
        'INSERT INTO orders (user_id, order_code, order_type, total, currency, status, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, orderCode, 'subscription', price, currency, 'pending', paymentMethod]
      );
      await conn.execute(
        'INSERT INTO order_items (order_id, course_id, item_title, price) VALUES (?, NULL, ?, ?)',
        [orderRes.insertId, 'Meekoo Premium Annual Plan (All Courses)', price]
      );
      return findOrderByIdConn(conn, orderRes.insertId);
    }

    const uniqueIds = [...new Set(courseIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))];
    if (uniqueIds.length === 0) {
      return { emptyCourses: true };
    }

    const placeholders = uniqueIds.map(() => '?').join(', ');
    const [courses] = await conn.execute(
      `SELECT id, title, price, currency
       FROM courses
       WHERE id IN (${placeholders}) AND is_published = 1 AND approval_status = 'approved'`,
      uniqueIds
    );

    if (courses.length !== uniqueIds.length) {
      return { invalidCourse: true };
    }

    const [alreadyEnrolled] = await conn.execute(
      `SELECT course_id FROM enrollments WHERE user_id = ? AND course_id IN (${placeholders})`,
      [userId, ...uniqueIds]
    );
    if (alreadyEnrolled.length > 0) {
      return { alreadyEnrolled: alreadyEnrolled.map((r) => r.course_id) };
    }

    const total = courses.reduce((sum, c) => sum + Number(c.price), 0);
    const currency = courses[0]?.currency || 'USD';

    const [orderRes] = await conn.execute(
      'INSERT INTO orders (user_id, order_code, order_type, total, currency, status, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, orderCode, 'course', Number(total.toFixed(2)), currency, 'pending', paymentMethod]
    );

    for (const course of courses) {
      await conn.execute(
        'INSERT INTO order_items (order_id, course_id, item_title, price) VALUES (?, ?, ?, ?)',
        [orderRes.insertId, course.id, course.title, Number(course.price)]
      );
    }

    return findOrderByIdConn(conn, orderRes.insertId);
  });
}

async function findOrderByIdConn(conn, orderId) {
  const [orders] = await conn.execute(
    `SELECT o.*, u.name AS user_name, u.email AS user_email
     FROM orders o
     JOIN users u ON u.id = o.user_id
     WHERE o.id = ? LIMIT 1`,
    [orderId]
  );
  const order = orders[0];
  if (!order) return null;
  const [items] = await conn.execute('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
  return { ...order, items };
}

export async function findOrderById(orderId) {
  return findOrderByIdConn(pool, orderId);
}

export async function processPaymentWebhookTransactional({ orderId, status, gatewayRef }) {
  return withTransaction(async (conn) => {
    const [orders] = await conn.execute('SELECT * FROM orders WHERE id = ? FOR UPDATE', [orderId]);
    const order = orders[0];
    if (!order) return null;

    if (order.status === 'paid') {
      return findOrderByIdConn(conn, orderId);
    }

    if (status === 'failed') {
      await conn.execute(
        "UPDATE orders SET status = 'failed', gateway_ref = ? WHERE id = ?",
        [gatewayRef || `FAIL-${Date.now()}`, orderId]
      );
      return findOrderByIdConn(conn, orderId);
    }

    await conn.execute(
      "UPDATE orders SET status = 'paid', gateway_ref = ?, paid_at = NOW() WHERE id = ?",
      [gatewayRef || `SBX-${crypto.randomBytes(4).toString('hex').toUpperCase()}`, orderId]
    );

    if (order.order_type === 'subscription') {
      const [activeSub] = await conn.execute(
        "SELECT id, ends_at FROM subscriptions WHERE user_id = ? AND status = 'active' AND ends_at > NOW() ORDER BY ends_at DESC LIMIT 1",
        [order.user_id]
      );
      if (activeSub.length > 0) {
        await conn.execute(
          'UPDATE subscriptions SET ends_at = DATE_ADD(ends_at, INTERVAL 1 YEAR), auto_renew = 1 WHERE id = ?',
          [activeSub[0].id]
        );
      } else {
        await conn.execute(
          "INSERT INTO subscriptions (user_id, plan, price, currency, status, auto_renew, starts_at, ends_at) VALUES (?, 'premium_annual', ?, ?, 'active', 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR))",
          [order.user_id, order.total, order.currency]
        );
      }
    } else {
      const [items] = await conn.execute('SELECT course_id FROM order_items WHERE order_id = ? AND course_id IS NOT NULL', [orderId]);
      for (const item of items) {
        await conn.execute(
          `INSERT INTO enrollments (user_id, course_id, progress_pct, enrolled_at)
           VALUES (?, ?, 0, NOW())
           ON DUPLICATE KEY UPDATE updated_at = NOW()`,
          [order.user_id, item.course_id]
        );
      }
    }

    return findOrderByIdConn(conn, orderId);
  });
}

export async function listUserOrders(userId) {
  const [orders] = await pool.execute(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  if (orders.length === 0) return [];
  const orderIds = orders.map((o) => o.id);
  const placeholders = orderIds.map(() => '?').join(', ');
  const [items] = await pool.execute(
    `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
    orderIds
  );
  const itemsByOrder = new Map();
  for (const item of items) {
    if (!itemsByOrder.has(item.order_id)) itemsByOrder.set(item.order_id, []);
    itemsByOrder.get(item.order_id).push(item);
  }
  return orders.map((o) => ({ ...o, items: itemsByOrder.get(o.id) || [] }));
}

export async function listAdminOrders() {
  const [orders] = await pool.execute(
    `SELECT o.*, u.name AS user_name, u.email AS user_email
     FROM orders o
     JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC`
  );
  if (orders.length === 0) return [];
  const orderIds = orders.map((o) => o.id);
  const placeholders = orderIds.map(() => '?').join(', ');
  const [items] = await pool.execute(
    `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
    orderIds
  );
  const itemsByOrder = new Map();
  for (const item of items) {
    if (!itemsByOrder.has(item.order_id)) itemsByOrder.set(item.order_id, []);
    itemsByOrder.get(item.order_id).push(item);
  }
  return orders.map((o) => ({ ...o, items: itemsByOrder.get(o.id) || [] }));
}

export async function getActiveSubscription(userId) {
  const [rows] = await pool.execute(
    "SELECT * FROM subscriptions WHERE user_id = ? AND status IN ('active', 'cancelled') AND ends_at > NOW() ORDER BY ends_at DESC LIMIT 1",
    [userId]
  );
  return rows[0] || null;
}

export async function updateSubscriptionAutoRenew(userId, autoRenew) {
  const [rows] = await pool.execute(
    "SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active' AND ends_at > NOW() ORDER BY ends_at DESC LIMIT 1",
    [userId]
  );
  if (rows.length === 0) return null;
  await pool.execute(
    'UPDATE subscriptions SET auto_renew = ? WHERE id = ?',
    [autoRenew ? 1 : 0, rows[0].id]
  );
  return getActiveSubscription(userId);
}

export async function getAdminOverviewStats() {
  const [[usersRow], [coursesRow], [pendingRow], [ordersRow], [subsRow]] = await Promise.all([
    pool.execute("SELECT COUNT(*) AS total_students FROM users WHERE role = 'student'"),
    pool.execute('SELECT COUNT(*) AS total_courses, SUM(is_published = 1) AS published_courses FROM courses'),
    pool.execute("SELECT COUNT(*) AS pending_approvals FROM courses WHERE approval_status = 'pending_review'"),
    pool.execute("SELECT COUNT(*) AS paid_orders, COALESCE(SUM(total), 0) AS total_revenue FROM orders WHERE status = 'paid'"),
    pool.execute("SELECT COUNT(*) AS active_subscriptions FROM subscriptions WHERE status = 'active' AND ends_at > NOW()")
  ]);

  return {
    totalStudents: Number(usersRow[0]?.total_students || 0),
    totalCourses: Number(coursesRow[0]?.total_courses || 0),
    publishedCourses: Number(coursesRow[0]?.published_courses || 0),
    pendingApprovals: Number(pendingRow[0]?.pending_approvals || 0),
    paidOrders: Number(ordersRow[0]?.paid_orders || 0),
    totalRevenue: Number(ordersRow[0]?.total_revenue || 0),
    activeSubscriptions: Number(subsRow[0]?.active_subscriptions || 0)
  };
}

export async function getMentorOverviewStats(mentorId) {
  const [[coursesRow], [studentsRow], [revenueRow], [sessionsRow]] = await Promise.all([
    pool.execute('SELECT COUNT(*) AS total_courses, SUM(is_published = 1) AS published_courses FROM courses WHERE mentor_id = ?', [mentorId]),
    pool.execute(
      `SELECT COUNT(DISTINCT e.user_id) AS total_students
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE c.mentor_id = ?`,
      [mentorId]
    ),
    pool.execute(
      `SELECT COALESCE(SUM(oi.price), 0) AS total_revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN courses c ON c.id = oi.course_id
       WHERE c.mentor_id = ? AND o.status = 'paid'`,
      [mentorId]
    ),
    pool.execute('SELECT COUNT(*) AS upcoming_sessions FROM live_sessions WHERE mentor_id = ? AND starts_at >= NOW()', [mentorId])
  ]);

  return {
    totalCourses: Number(coursesRow[0]?.total_courses || 0),
    publishedCourses: Number(coursesRow[0]?.published_courses || 0),
    totalStudents: Number(studentsRow[0]?.total_students || 0),
    totalRevenue: Number(revenueRow[0]?.total_revenue || 0),
    upcomingSessions: Number(sessionsRow[0]?.upcoming_sessions || 0)
  };
}

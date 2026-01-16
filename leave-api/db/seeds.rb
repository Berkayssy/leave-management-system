User.destroy_all if User.any?
Leave.destroy_all if Leave.any?

User.create!(
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123',
  password_confirmation: 'admin123',
  role: 'admin'
)

User.create!(
  name: 'Manager User',
  email: 'manager@example.com',
  password: 'manager123',
  password_confirmation: 'manager123',
  role: 'manager'
)

User.create!(
  name: 'Employee User',
  email: 'employee@example.com',
  password: 'employee123',
  password_confirmation: 'employee123',
  role: 'employee'
)

Leave.create!(
  user_id: User.find_by(email: 'employee@example.com').id,
  leave_type: 'annual',
  start_date: Date.today + 7.days,
  end_date: Date.today + 9.days,
  reason: 'Annual leave',
  status: 'pending'
)

Leave.create!(
  user_id: User.find_by(email: 'manager@example.com').id,
  leave_type: 'sick',
  start_date: Date.today + 1.day,
  end_date: Date.today + 2.days,
  reason: 'Sick leave',
  status: 'approved'
)
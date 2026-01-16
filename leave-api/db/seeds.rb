# Önceki verileri temizle
User.destroy_all
Leave.destroy_all

# Kullanıcılar
admin = User.create!(
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'password123',
  role: 'admin'
)

manager = User.create!(
  name: 'Manager User',
  email: 'manager@example.com',
  password: 'password123',
  role: 'manager'
)

employee = User.create!(
  name: 'Employee User',
  email: 'employee@example.com',
  password: 'password123',
  role: 'employee'
)

# İzin kayıtları
Leave.create!([
  {
    user: employee,
    start_date: Date.today + 7.days,
    end_date: Date.today + 10.days,
    leave_type: 'annual',
    reason: 'Family vacation',
    status: 'pending'
  },
  {
    user: employee,
    start_date: Date.today - 5.days,
    end_date: Date.today - 3.days,
    leave_type: 'sick',
    reason: 'Flu',
    status: 'approved'
  }
])

puts "Created #{User.count} users and #{Leave.count} leaves"
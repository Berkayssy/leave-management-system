# db/seeds.rb

User.destroy_all if User.any?
Leave.destroy_all if Leave.any?

# Admin kullanıcı
admin = User.create!(
  name: 'Yönetici Admin',
  email: 'admin@sirket.com',
  password: 'admin123',
  password_confirmation: 'admin123',
  role: 'admin',
  remaining_leaves: 20
)

# Manager kullanıcı
manager = User.create!(
  name: 'Proje Yöneticisi',
  email: 'manager@sirket.com',
  password: 'manager123',
  password_confirmation: 'manager123',
  role: 'manager',
  remaining_leaves: 18
)

# Employee kullanıcı
employee = User.create!(
  name: 'Çalışan Personel',
  email: 'employee@sirket.com',
  password: 'employee123',
  password_confirmation: 'employee123',
  role: 'employee',
  remaining_leaves: 15
)

# Employee için izin talebi
Leave.create!(
  user_id: employee.id,
  leave_type: 'annual',
  start_date: Date.today + 7.days,
  end_date: Date.today + 9.days,
  reason: 'Yıllık izin kullanımı',
  status: 'pending'
)

# Manager için izin talebi
Leave.create!(
  user_id: manager.id,
  leave_type: 'sick',
  start_date: Date.today + 1.day,
  end_date: Date.today + 2.days,
  reason: 'Hastalık izni',
  status: 'approved'
)
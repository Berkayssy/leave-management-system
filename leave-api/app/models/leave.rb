class Leave < ApplicationRecord
  belongs_to :user
  
  validates :start_date, :end_date, :leave_type, presence: true
  validates :leave_type, inclusion: { in: %w[annual sick unpaid emergency] }
  validates :status, inclusion: { in: %w[pending approved rejected] }, allow_nil: true
  
  validate :end_date_after_start_date
  
  # Scope'lar
  scope :pending, -> { where(status: 'pending') }
  scope :approved, -> { where(status: 'approved') }
  scope :rejected, -> { where(status: 'rejected') }
  scope :recent, -> { where('created_at >= ?', 7.days.ago) }
  
  # Hesaplanan alanlar
  def duration
    (end_date - start_date).to_i + 1
  end
  
  def is_pending?
    status == 'pending'
  end
  
  def is_approved?
    status == 'approved'
  end
  
  def can_be_managed_by?(user)
    user.role == 'manager' || user.role == 'admin'
  end
  
  private
  
  def end_date_after_start_date
    return if end_date.blank? || start_date.blank?
    
    if end_date < start_date
      errors.add(:end_date, "must be after start date")
    end
  end
end
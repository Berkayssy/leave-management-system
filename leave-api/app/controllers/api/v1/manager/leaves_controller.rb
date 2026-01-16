module Api::V1::Manager
  class LeavesController < ApplicationController
    before_action :require_manager_role!
    
    # GET /api/v1/manager/leaves
    def index
      # Tüm leaves'leri göster (pagination olmadan basit versiyon)
      leaves = Leave.includes(:user).order(created_at: :desc)
      
      # Status filtresi
      if params[:status].present?
        leaves = leaves.where(status: params[:status])
      end
      
      render json: leaves.as_json(include: { 
        user: { only: [:id, :name, :email, :role] } 
      })
    end
    
    # GET /api/v1/manager/leaves/dashboard
    def dashboard
      # Dashboard istatistikleri
      total_leaves = Leave.count
      pending_leaves = Leave.where(status: 'pending').count
      approved_leaves = Leave.where(status: 'approved').count
      rejected_leaves = Leave.where(status: 'rejected').count
      
      # Son 7 günün istatistikleri (basit versiyon)
      recent_leaves = {}
      6.downto(0) do |i|
        date = i.days.ago.to_date.to_s
        count = Leave.where('created_at >= ? AND created_at < ?', 
                         i.days.ago.beginning_of_day, 
                         (i-1).days.ago.beginning_of_day).count
        recent_leaves[date] = count
      end
      
      # Leave type dağılımı
      leave_types = Leave.group(:leave_type).count
      
      # Recent pending leaves (son 5)
      recent_pending = Leave.includes(:user)
                           .where(status: 'pending')
                           .order(created_at: :desc)
                           .limit(5)
      
      render json: {
        stats: {
          total: total_leaves,
          pending: pending_leaves,
          approved: approved_leaves,
          rejected: rejected_leaves
        },
        recent_leaves: recent_leaves,
        leave_types: leave_types,
        recent_pending: recent_pending.as_json(include: { user: { only: [:id, :name, :email] } })
      }
    end
    
    # PATCH /api/v1/manager/leaves/:id/approve
    def approve
      leave = Leave.find(params[:id])
      
      if leave.update(status: 'approved')
        render json: { 
          message: 'Leave approved successfully',
          leave: leave 
        }
      else
        render json: leave.errors, status: :unprocessable_entity
      end
    end
    
    # PATCH /api/v1/manager/leaves/:id/reject
    def reject
      leave = Leave.find(params[:id])
      
      if leave.update(status: 'rejected', manager_notes: params[:manager_notes])
        render json: { 
          message: 'Leave rejected successfully',
          leave: leave 
        }
      else
        render json: leave.errors, status: :unprocessable_entity
      end
    end

    def show 
      @leave = Leave.find(params[:id])
      render json: @leave.as_json(include: { 
        user: { only: [:id, :name, :email, :role] } 
      })
    end
    
    private
    
    def require_manager_role!
      unless current_user&.role == 'manager' || current_user&.role == 'admin'
        render json: { error: 'Requires manager or admin role' }, status: :forbidden
      end
    end
  end
end
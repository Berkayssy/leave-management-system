module Api::V1
  class LeavesController < ApplicationController
    before_action :set_leave, only: [:show, :update, :destroy]
    
    # GET /api/v1/leaves
    def index

      if current_user.role.in?(['manager', 'admin'])
        @leaves = Leave.all.order(created_at: :desc)
      else
        @leaves = current_user.leaves.order(created_at: :desc)
      end
      render json: @leaves
    end
    
    
    # GET /api/v1/leaves/1
    def show
      render json: @leave
    end
    
    # POST /api/v1/leaves
    def create
      @leave = current_user.leaves.new(leave_params)
      @leave.status = 'pending'
      
      if @leave.save
        render json: @leave, status: :created
      else
        render json: @leave.errors, status: :unprocessable_entity
      end
    end
    
    # PATCH/PUT /api/v1/leaves/1
    def update
      if @leave.update(leave_params)
        render json: @leave
      else
        render json: @leave.errors, status: :unprocessable_entity
      end
    end
    
    # DELETE /api/v1/leaves/1
    def destroy
      @leave.destroy
      head :no_content
    end
    
    private
    
    def set_leave
      @leave = current_user.leaves.find(params[:id])
    end
    
    def leave_params
      params.require(:leave).permit(:start_date, :end_date, :leave_type, :reason)
    end
  end
end
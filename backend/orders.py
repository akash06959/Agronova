from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
import json

try:
    from .db import get_db
    from .models import Order, User
    from .schemas import OrderCreate, OrderOut
except ImportError:
    from db import get_db
    from models import Order, User
    from schemas import OrderCreate, OrderOut


router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_order(order: OrderCreate, user_id: int = Query(...), db: Session = Depends(get_db)):
    """Create a new order for a user"""
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        # Determine initial status based on payment method
        initial_status = "confirmed" if order.payment_method == "card" else "pending"
        
        # Create order
        db_order = Order(
            user_id=user_id,
            items=json.dumps(order.items),  # Convert to JSON string
            total_amount=order.total_amount,
            payment_method=order.payment_method,
            shipping_address=order.shipping_address,
            city=order.city,
            state=order.state,
            pincode=order.pincode,
            status=initial_status
        )
        
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        
        # Return parsed order
        return {
            "id": db_order.id,
            "user_id": db_order.user_id,
            "items": json.loads(db_order.items),
            "total_amount": db_order.total_amount,
            "payment_method": db_order.payment_method,
            "shipping_address": db_order.shipping_address,
            "city": db_order.city,
            "state": db_order.state,
            "pincode": db_order.pincode,
            "status": db_order.status,
            "created_at": db_order.created_at
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")


@router.get("/user/{user_id}", response_model=List[OrderOut])
def get_user_orders(user_id: int, db: Session = Depends(get_db)):
    """Get all orders for a specific user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    orders = db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()
    
    # Parse JSON string to dict for each order
    for order in orders:
        order.items = json.loads(order.items) if isinstance(order.items, str) else order.items
    
    return orders


@router.get("/all", response_model=List[OrderOut])
def get_all_orders(db: Session = Depends(get_db)):
    """Get all orders (admin only)"""
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    
    # Parse JSON string to dict for each order
    for order in orders:
        order.items = json.loads(order.items) if isinstance(order.items, str) else order.items
    
    return orders


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get a specific order by ID"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Parse JSON string to dict
    order.items = json.loads(order.items) if isinstance(order.items, str) else order.items
    
    return order


@router.patch("/{order_id}/cancel")
def cancel_order(order_id: int, user_id: int = Query(...), db: Session = Depends(get_db)):
    """Cancel an order"""
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Verify the order belongs to the user
    if order.user_id != user_id:
        raise HTTPException(status_code=403, detail="You can only cancel your own orders")
    
    # Only allow cancelling pending or confirmed orders
    if order.status not in ["pending", "confirmed"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot cancel order with status '{order.status}'. Only pending or confirmed orders can be cancelled."
        )
    
    try:
        # Update order status
        order.status = "cancelled"
        db.commit()
        
        # Parse JSON string to dict for response
        order.items = json.loads(order.items) if isinstance(order.items, str) else order.items
        
        return {
            "id": order.id,
            "user_id": order.user_id,
            "items": order.items,
            "total_amount": order.total_amount,
            "payment_method": order.payment_method,
            "shipping_address": order.shipping_address,
            "city": order.city,
            "state": order.state,
            "pincode": order.pincode,
            "status": order.status,
            "created_at": order.created_at
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to cancel order: {str(e)}")


@router.patch("/{order_id}/status")
def update_order_status(order_id: int, status_data: dict, db: Session = Depends(get_db)):
    """Update order status (admin only)"""
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    new_status = status_data.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Status is required")
    
    valid_statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    try:
        # Update order status
        order.status = new_status
        db.commit()
        
        # Parse JSON string to dict for response
        order.items = json.loads(order.items) if isinstance(order.items, str) else order.items
        
        return {
            "id": order.id,
            "user_id": order.user_id,
            "items": order.items,
            "total_amount": order.total_amount,
            "payment_method": order.payment_method,
            "shipping_address": order.shipping_address,
            "city": order.city,
            "state": order.state,
            "pincode": order.pincode,
            "status": order.status,
            "created_at": order.created_at
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update order status: {str(e)}")


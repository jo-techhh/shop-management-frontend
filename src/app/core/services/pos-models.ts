export interface CartItem { variant_id: string; sku: string; title: string; unit_price: number; quantity: number; }
export interface OrderDto {
  id: string; invoice_number: string; outlet_id: string; cashier_id: string; status: string;
  subtotal: number; tax_amount: number; discount_amount: number; total_amount: number;
  customer_name: string | null; customer_phone: string | null; created_at: string;
  items: { id: string; variant_id: string; sku: string; title: string; unit_price: number; quantity: number; line_total: number }[];
}
export interface ShiftDto { id: string; outlet_id: string; opening_float: number; expected_cash: number; opened_at: string; status: string; }
export interface ReceiptDto extends OrderDto { escpos_thermal_text: string; }

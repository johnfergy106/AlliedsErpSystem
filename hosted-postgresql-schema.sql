-- Allied ERP hosted production starter schema.
-- This is for the future hosted HTTPS version where the server is the system of record.

create table if not exists users (
  id bigserial primary key,
  username text not null unique,
  password_hash text not null,
  display_name text not null,
  role text not null check (role in ('super_admin', 'admin', 'sales', 'credit', 'shipping')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customers (
  id bigserial primary key,
  owner_user_id bigint references users(id),
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  cell_phone text,
  preferred_phone text check (preferred_phone in ('phone', 'cell')),
  address text,
  city text,
  state text,
  zip text,
  account_number text,
  account_type text check (account_type in ('new', 'old', 'rehash')),
  promo_number text,
  purchase_order text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id bigserial primary key,
  owner_user_id bigint references users(id),
  sku text not null,
  name text not null,
  category text,
  unit_price numeric(12,2) not null default 0,
  is_shared boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sales_orders (
  id bigserial primary key,
  visible_order_number text,
  daily_order_number integer,
  part_number integer,
  customer_id bigint references customers(id),
  sales_rep_user_id bigint references users(id),
  status text not null,
  status_changed_at timestamptz,
  status_changed_by_user_id bigint references users(id),
  order_date date not null default current_date,
  ship_date date,
  account_number text,
  tracking_info text,
  bill_to text,
  notes text,
  verification_method text,
  verification_summary text,
  verification_recording_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sales_order_items (
  id bigserial primary key,
  sales_order_id bigint not null references sales_orders(id) on delete cascade,
  product_id bigint references products(id),
  sku text,
  product_name text not null,
  quantity numeric(12,2) not null,
  unit_price numeric(12,2) not null
);

create table if not exists order_status_history (
  id bigserial primary key,
  sales_order_id bigint not null references sales_orders(id) on delete cascade,
  status text not null,
  changed_by_user_id bigint references users(id),
  changed_at timestamptz not null default now(),
  notes text
);

create table if not exists order_messages (
  id bigserial primary key,
  sales_order_id bigint not null references sales_orders(id) on delete cascade,
  author_user_id bigint references users(id),
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_sales_orders_status on sales_orders(status);
create index if not exists idx_sales_orders_sales_rep on sales_orders(sales_rep_user_id);
create index if not exists idx_customers_owner on customers(owner_user_id);
create index if not exists idx_products_owner on products(owner_user_id);

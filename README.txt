Allied Industrial Supplies ERP MVP

Run as a web application
1. Host this folder on any static web server.
2. Open index.html from the hosted URL.
3. In Chrome or Edge, use the browser install option to install it as an app when prompted.

Run as a downloaded local application
1. Extract the Allied-ERP-Application.zip file.
2. Open start-allied-erp.bat on Windows.
3. Go to http://10.41.25.188:4173 in Chrome, Edge, or another modern browser from another computer on the same network.
4. Keep the launcher window open while using the ERP.
5. If the server computer has a different LAN IP address, update publicHost in config.json or set ALLIED_ERP_PUBLIC_HOST.

Login accounts
- Ask the Super Admin for employee usernames and passwords.
- Change any starter passwords before using the app for live company records.
- Credit Dept. and Shipping users are included, but admin must set their passwords in Users before first login.

Admin user management
- Log in as admin.
- Open Users.
- Select New User to create or update a user name, username, password, and role.
- Sales reps see their own orders. Credit Dept. sees verified orders. Shipping sees orders with Sent to Shipping status.
- Super Admin has all app features. Secondary Admin users can see submitted orders but do not have packing-list or daily order-number assignment access.
- Only Super Admin can create or edit other Super Admin users.
- Only Super Admin can view saved passwords on user accounts. Admin users can reset passwords without seeing the existing password.
- Sales reps only see customers tied to their own orders or customers they created. Other sales reps cannot see those customer records.
- Credit Dept. keeps orders visible after they move from Verified into Credit Hold, Sent to Shipping, Order Shipped, or Cancelled.
- Shipping keeps orders visible after Sent to Shipping, including Order Shipped or Cancelled.
- Status changes reset the order filter to All Statuses so the moved customer/order remains visible.

Notes
- Data is saved in the browser on the device where the app is used.
- Company install settings are saved in config.json.
- The app release number is saved in version.json.
- The local server listens on 0.0.0.0 by default so employees on the same network can connect.
- Assistant Verification settings are entered inside the Assistant screen.
- Admins can edit the Assistant connection. Sales reps can view it but cannot edit it.
- Admin users can manually verify orders. Assistant Verification is available for Old account types.
- Sales orders can be marked Cancelled when a customer cancels during verification.
- Sales orders include a customer phone number for Vapi verification calls.
- Sales orders include optional account number, optional ship date, optional tracking information, bill-to, card name/last 4/expiration/CCV received flag, follow-up date/time/notes, and New/Old/Rehash account type.
- Sales orders use the customer card contact as the buyer name automatically.
- Sales orders include an optional Promo Ticket section with company, account, rep, promo, name, address, city, state, zip, residential/business type, and notes.
- Kickback Pending is available in the main order status dropdown.
- Admins can manually change sales order status from the dashboard or sales order list.
- All users can filter order dashboards and sales order lists by status.
- Workflow statuses include Pending AP, Credit Hold, Kickback Pending, Partial Ship, Sent to Shipping, Order Shipped, Completed, and Cancelled.
- Credit Dept. can assign daily order numbers from 1 to 10,000,000 and print/download orders.
- Credit Dept. can change status at any time on orders available to Credit.
- Shipping can view and print packing lists.
- Packing lists include Back Ordered, optional tracking information, Alliedsupplies.net, and the no-returns authorization footer.
- Part labels are added only when Save and Add Part is used, and part orders run from Part 1 through Part 10.
- Customer records include phone, cell phone, and preferred verification number.
- Status rows show the date/time and user who last changed the status.
- Credit Hold requires notes from Credit Dept. or admin.
- New sales orders use a Save and Close button and return to the sales order list after saving.
- Stock levels are not shown in the app screens.
- Verified sales orders can be downloaded and printed from the Sales Orders screen.
- Admins can print sales orders and verification records from the Sales Orders screen.
- Vapi verification MP3 recordings can be downloaded from verified orders when Vapi returns a recording URL.
- Sales reps and admins can chat inside each sales order from the Sales Orders screen.
- The top bar includes a notifications center for order chats, pending verification, and verification issues.
- Customers and product catalog items can be deleted from their list screens with confirmation prompts. Sales orders can be removed from the current user's dashboard/order list without deleting them for other users.
- New product catalog items are private to the user who created them. Starter catalog products remain shared.

// Test users
const users = [
    { email: 'f1@gmail.com', password: '123', role: 'farmer', name: 'أحمد المزارع', phone: '01234567890', rating: 4.5, numRatings: 12 },
    { email: 'm1@gmail.com', password: '123', role: 'merchant', name: 'محمد التاجر', phone: '01234567891' },
    { email: 'c1@gmail.com', password: '123', role: 'consumer', name: 'علي المستهلك', phone: '01234567892' },
    { email: 'fa@gmail.com', password: '123', role: 'factory', name: 'مصنع الخير', phone: '01234567893' }
];;

// Sample data
let products = [
    { id: 1, farmerId: 1, product: 'طماطم', description: 'طماطم طازجة من المزرعة', quantity: 1000, unit: 'kg', price: 10, available: true, imageUrl: 'images/tomato.jpg', deliveryType: 'farm' },
    { id: 2, farmerId: 1, product: 'خيار', description: 'خيار طازج عالي الجودة', quantity: 500, unit: 'kg', price: 8, available: true, imageUrl: 'images/cucumber.jpg', deliveryType: 'factory' },
    { id: 3, farmerId: 1, product: 'بطاطس', description: 'بطاطس مصرية فاخرة', quantity: 2000, unit: 'kg', price: 12, available: true, imageUrl: 'images/potato.jpg', deliveryType: 'buyer' }
];

let orders = [
    { 
        id: 1, 
        buyerId: 2, 
        buyerPhone: '',
        farmerId: 1,
        farmerPhone: '', 
        product: 'طماطم', 
        quantity: 100, 
        status: 'pending', 
        date: '2024-02-09',
        deliveryDays: null,
        expectedDeliveryDate: null
    }
];

function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const role = formData.get('role');

    const user = users.find(u => u.email === email && u.password === password && u.role === role);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        showDashboard(user);
    } else {
        showNotification('بيانات غير صحيحة', 'error');
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 25px;
        border-radius: 10px;
        background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
        color: white;
        font-weight: bold;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        animation: slideIn 0.5s ease;
    `;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function showDashboard(user) {
    document.getElementById('authView').style.display = 'none';
    document.getElementById('dashboardView').style.display = 'block';
    document.getElementById('welcomeMessage').innerHTML = `
        <i class="fas fa-user-circle"></i>
        مرحباً ${user.name}
    `;
    
    switch(user.role) {
        case 'farmer':
            showFarmerDashboard(user);
            break;
        case 'merchant':
        case 'consumer':
        case 'factory':
            showBuyerDashboard(user);
            break;
    }
}

function showFarmerDashboard(user) {
    const content = document.getElementById('mainContent');
    const myProducts = products.filter(p => p.farmerId === user.id);
    const myOrders = orders.filter(o => o.farmerId === user.id);
    
    const totalSales = myOrders.filter(o => o.status === 'accepted')
        .reduce((sum, order) => sum + order.quantity, 0);
    const totalProducts = myProducts.length;

    content.innerHTML = `
        <div class="stats animate-in">
            <div class="stat-card">
                <div class="stat-value">${totalProducts}</div>
                <div class="stat-label">إجمالي المنتجات</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${totalSales}</div>
                <div class="stat-label">إجمالي المبيعات (كجم)</div>
            </div>
        </div>

        <div class="card animate-in">
            <h3><i class="fas fa-plus-circle"></i> إضافة منتج جديد</h3>
            <form onsubmit="addProduct(event)">
                <div class="form-group">
                    <label><i class="fas fa-seedling"></i> المنتج</label>
                    <input type="text" name="product" class="form-control" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-info-circle"></i> تفاصيل المنتج</label>
                    <textarea name="description" class="form-control" rows="3" required placeholder="أدخل وصفًا تفصيليًا للمنتج..."></textarea>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-weight"></i> الكمية</label>
                    <div style="display: flex; gap: 10px;">
                        <input type="number" name="quantity" class="form-control" required style="flex: 1;">
                        <select name="unit" class="form-control" style="width: 100px;">
                            <option value="كجم">كجم</option>
                            <option value="طن">طن</option>
                            <option value="قطعة">قطعة</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-tag"></i> السعر للوحدة</label>
                    <input type="number" name="price" class="form-control" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-truck"></i> نوع التوصيل</label>
                    <select name="deliveryType" class="form-control" required>
                        <option value="farm">تسليم على الأرض</option>
                        <option value="factory">تسليم في المصنع</option>
                        <option value="buyer">توصيل للمشتري</option>
                    </select>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-image"></i> صورة المنتج</label>
                    <input type="file" accept="image/*" onchange="handleImageUpload(event)" class="form-control">
                    <img id="imagePreview" style="display: none; max-width: 100%; height: 200px; object-fit: cover; margin-top: 10px; border-radius: 8px;">
                </div>
                <button type="submit" class="btn">
                    <i class="fas fa-plus"></i>
                    إضافة
                </button>
            </form>
        </div>

        <div class="card animate-in">
            <h3><i class="fas fa-box"></i> منتجاتي</h3>
            <div class="grid">
                ${myProducts.map(p => `
                    <div class="product-card">
                        <div class="product-image">
                            <img src="${p.imageUrl}" alt="${p.product}" 
                                 onerror="this.src='images/default-product.jpg'"
                                 style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div class="product-info">
                            <div class="product-title">${p.product}</div>
                            <p class="product-description">${p.description || 'لا يوجد وصف'}</p>
                            <p><i class="fas fa-weight"></i> الكمية: ${p.quantity} ${getUnitDisplay(p.unit)}</p>
                            <p><i class="fas fa-tag"></i> السعر: ${p.price} جنيه لكل ${getUnitDisplay(p.unit)}</p>
                            <p><i class="fas fa-truck"></i> التوصيل: ${getDeliveryTypeDisplay(p.deliveryType)}</p>
                            <p>
                                <span class="status ${p.available ? 'status-accepted' : 'status-rejected'}">
                                    <i class="fas fa-${p.available ? 'check-circle' : 'times-circle'}"></i>
                                    ${p.available ? 'متاح' : 'غير متاح'}
                                </span>
                            </p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="card animate-in">
            <h3><i class="fas fa-shopping-cart"></i> الطلبات الواردة</h3>
            <table>
                <thead>
                    <tr>
                        <th>المنتج</th>
                        <th>الكمية</th>
                        <th>نوع المشتري</th>
                        <th>التاريخ</th>
                        <th>الحالة</th>
                        <th>معلومات التواصل</th>
                        <th>موعد التسليم</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${myOrders.map(o => {
                        const buyer = users.find(u => u.id === o.buyerId);
                        return `
                            <tr>
                                <td><i class="fas fa-${getProductIcon(o.product)}"></i> ${o.product}</td>
                                <td>${o.quantity} كجم</td>
                                <td>${buyer.role === 'merchant' ? 'تاجر' : 'مستهلك'}</td>
                                <td><i class="far fa-calendar"></i> ${formatDate(o.date)}</td>
                                <td><span class="status status-${o.status}">${getStatusText(o.status)}</span></td>
                                <td>
                                    ${o.status === 'accepted' ? `
                                        <p><i class="fas fa-phone"></i> رقم المشتري: ${o.buyerPhone}</p>
                                    ` : '-'}
                                </td>
                                <td>
                                    ${o.status === 'accepted' ? `
                                        <p><i class="fas fa-calendar-check"></i> خلال ${o.deliveryDays} أيام</p>
                                        <p><i class="fas fa-truck"></i> التسليم: ${formatDate(o.expectedDeliveryDate)}</p>
                                    ` : '-'}
                                </td>
                                <td>
                                    ${o.status === 'pending' ? `
                                        <button onclick="updateOrderStatus(${o.id}, 'accepted')" class="btn" style="background: var(--success-color); margin-left: 5px;">
                                            <i class="fas fa-check"></i> قبول
                                        </button>
                                        <button onclick="updateOrderStatus(${o.id}, 'rejected')" class="btn" style="background: var(--danger-color);">
                                            <i class="fas fa-times"></i> رفض
                                        </button>
                                    ` : '-'}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function getDeliveryTypeDisplay(type) {
    switch(type) {
        case 'farm': return 'تسليم على الأرض';
        case 'factory': return 'تسليم في المصنع';
        case 'buyer': return 'توصيل للمشتري';
        default: return 'غير محدد';
    }
}
function getUnitDisplay(unit) {
    switch(unit) {
        case 'kg': return 'كجم';
        case 'pallet': return 'طبلية';
        case 'piece': return 'قطعة';
        default: return 'كجم'; // Default to kg if not specified
    }
}
function handleImageUpload(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}
function showBuyerDashboard(user) {
    const content = document.getElementById('mainContent');
    const myOrders = orders.filter(o => o.buyerId === user.id);
    
    const totalOrders = myOrders.length;
    const acceptedOrders = myOrders.filter(o => o.status === 'accepted').length;

    // بداية محتوى الإحصائيات المشترك
    let dashboardHTML = `
        <div class="stats animate-in">
            <div class="stat-card">
                <div class="stat-value">${totalOrders}</div>
                <div class="stat-label">إجمالي طلباتي</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${acceptedOrders}</div>
                <div class="stat-label">الطلبات المقبولة</div>
            </div>
        </div>
    `;

    // بناء HTML لجدول الطلبات مع معلومات التواصل والتسليم
    const ordersTableHTML = `
        <div class="card animate-in">
            <h3><i class="fas fa-history"></i> ${user.role === 'consumer' ? 'طلباتي' : 'طلبات الجملة'}</h3>
            <table>
                <thead>
                    <tr>
                        <th>المنتج</th>
                        <th>الكمية</th>
                        <th>التاريخ</th>
                        <th>الحالة</th>
                        <th>معلومات التواصل</th>
                        <th>موعد التسليم</th>
                    </tr>
                </thead>
                <tbody>
                    ${myOrders.map(o => `
                        <tr>
                            <td><i class="fas fa-${getProductIcon(o.product)}"></i> ${o.product}</td>
                            <td>${o.quantity} كجم</td>
                            <td><i class="far fa-calendar"></i> ${formatDate(o.date)}</td>
                            <td><span class="status status-${o.status}">${getStatusText(o.status)}</span></td>
                            <td>
                                ${o.status === 'accepted' ? `
                                    <div class="contact-info">
                                        <p><i class="fas fa-phone"></i> رقم الفلاح: ${o.farmerPhone || 'غير متوفر'}</p>
                                    </div>
                                ` : '-'}
                            </td>
                            <td>
                                ${o.status === 'accepted' ? `
                                    <div class="delivery-info">
                                        ${o.deliveryDays ? `<p><i class="fas fa-clock"></i> التوصيل خلال: ${o.deliveryDays} أيام</p>` : ''}
                                        ${o.expectedDeliveryDate ? `<p><i class="fas fa-calendar-check"></i> موعد التسليم: ${formatDate(o.expectedDeliveryDate)}</p>` : ''}
                                    </div>
                                ` : '-'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    if (user.role === 'consumer') {
        // عرض المستهلك
        dashboardHTML += `
            <div class="card animate-in">
                <h3><i class="fas fa-store"></i> المنتجات المتاحة للمستهلكين</h3>
                <div class="grid">
                    ${products.filter(p => p.available).map(p => `
                        <div class="product-card">
                            <div class="product-image">
                                <img src="${p.imageUrl}" alt="${p.product}">
                            </div>
                            <div class="product-info">
                                <div class="product-title">${p.product}</div>
                                <p class="product-description">${p.description || 'لا يوجد وصف'}</p>
                                <p><i class="fas fa-weight"></i> الكمية المتاحة: ${p.quantity} ${p.unit || 'كجم'}</p>
                                <p><i class="fas fa-tag"></i> السعر: ${p.price} جنيه لكل ${p.unit || 'كجم'}</p>
                                <p><i class="fas fa-truck"></i> التوصيل: ${getDeliveryTypeDisplay(p.deliveryType)}</p>
                                <form onsubmit="placeOrder(event, ${p.id})" class="form-group">
                                    <label>الكمية المطلوبة (الحد الأقصى 5 ${p.unit || 'كجم'})</label>
                                    <input type="number" 
                                        name="quantity" 
                                        class="form-control" 
                                        min="1"
                                        max="5"
                                        required
                                    >
                                    <button type="submit" class="btn" style="margin-top: 10px;">
                                        <i class="fas fa-shopping-cart"></i> طلب
                                    </button>
                                </form>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ${ordersTableHTML}
        `;
    } else if (user.role === 'merchant') {
        // عرض التاجر
        dashboardHTML += `
            <div class="card animate-in">
                <h3><i class="fas fa-store"></i> المنتجات المتاحة للتجار</h3>
                <div class="grid">
                    ${products.filter(p => p.available && p.quantity >= 5).map(p => `
                        <div class="product-card">
                            <div class="product-image">
                                <img src="${p.imageUrl}" alt="${p.product}">
                            </div>
                            <div class="product-info">
                                <div class="product-title">${p.product}</div>
                                <p class="product-description">${p.description || 'لا يوجد وصف'}</p>
                                <p><i class="fas fa-weight"></i> الكمية المتاحة: ${p.quantity} ${p.unit || 'كجم'}</p>
                                <p><i class="fas fa-tag"></i> السعر: ${p.price} جنيه لكل ${p.unit || 'كجم'}</p>
                                <p><i class="fas fa-truck"></i> التوصيل: ${getDeliveryTypeDisplay(p.deliveryType)}</p>
                                <form onsubmit="placeOrder(event, ${p.id})" class="form-group">
                                    <label>الكمية المطلوبة (الحد الأدنى 5 ${p.unit || 'كجم'})</label>
                                    <input type="number" 
                                        name="quantity" 
                                        class="form-control" 
                                        min="5"
                                        max="${p.quantity}"
                                        required
                                    >
                                    <button type="submit" class="btn" style="margin-top: 10px;">
                                        <i class="fas fa-shopping-cart"></i> طلب جملة
                                    </button>
                                </form>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            ${ordersTableHTML}
        `;
        
    }
    else if (user.role === 'factory') {
        // عرض مصنع
        dashboardHTML += `
            <div class="card animate-in">
                <h3><i class="fas fa-store"></i> المنتجات المتاحة للتجار</h3>
                <div class="grid">
                    ${products.filter(p => p.available && p.quantity >= 10).map(p => `
                        <div class="product-card">
                            <div class="product-image">
                                <img src="${p.imageUrl}" alt="${p.product}">
                            </div>
                            <div class="product-info">
                                <div class="product-title">${p.product}</div>
                                <p class="product-description">${p.description || 'لا يوجد وصف'}</p>
                                <p><i class="fas fa-weight"></i> الكمية المتاحة: ${p.quantity} ${p.unit || 'كجم'}</p>
                                <p><i class="fas fa-tag"></i> السعر: ${p.price} جنيه لكل ${p.unit || 'كجم'}</p>
                                <p><i class="fas fa-truck"></i> التوصيل: ${getDeliveryTypeDisplay(p.deliveryType)}</p>
                                <form onsubmit="placeOrder(event, ${p.id})" class="form-group">
                                    <label>الكمية المطلوبة (الحد الأدنى 10 ${p.unit || 'كجم'})</label>
                                    <input type="number" 
                                        name="quantity" 
                                        class="form-control" 
                                        min="10"
                                        max="${p.quantity}"
                                        required
                                    >
                                    <button type="submit" class="btn" style="margin-top: 10px;">
                                        <i class="fas fa-shopping-cart"></i> طلب جملة
                                    </button>
                                </form>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            ${ordersTableHTML}
        `;
                    }

    // عرض المحتوى النهائي
    content.innerHTML = dashboardHTML;
}
function getProductIcon(product) {
    const icons = {
        'طماطم': 'tomato',
        'خيار': 'cucumber',
        'بطاطس': 'potato'
    };
    return icons[product] || 'seedling';
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
}

function getStatusText(status) {
    const icons = {
        'pending': '<i class="fas fa-clock"></i>',
        'accepted': '<i class="fas fa-check-circle"></i>',
        'rejected': '<i class="fas fa-times-circle"></i>'
    };
    const texts = {
        'pending': 'قيد الانتظار',
        'accepted': 'تم القبول',
        'rejected': 'تم الرفض'
    };
    return `${icons[status]} ${texts[status]}`;
}
const defaultImages = {
    'طماطم': 'images/tomato.jpg',
    'خيار': 'images/cucumber.jpg',
    'بطاطس': 'images/potato.jpg',
    'default': 'images/default-product.jpg'
};

function addProduct(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const productName = formData.get('product');
    const imageInput = document.querySelector('input[type="file"]');
    
    let imageUrl = defaultImages[productName] || defaultImages.default;
    
    // If a file was uploaded, use its Data URL
    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const newProduct = {
                id: products.length + 1,
                farmerId: user.id,
                product: productName,
                description: formData.get('description'),
                quantity: Number(formData.get('quantity')),
                price: Number(formData.get('price')),
                unit: formData.get('unit'),
                available: true,
                imageUrl: e.target.result,
                deliveryType: formData.get('deliveryType')
            };

            products.push(newProduct);
            showFarmerDashboard(user);
            event.target.reset();
            document.getElementById('imagePreview').style.display = 'none';
            showNotification('تم إضافة المنتج بنجاح');
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        // No image uploaded, use default image
        const newProduct = {
            id: products.length + 1,
            farmerId: user.id,
            product: productName,
            description: formData.get('description'),
            quantity: Number(formData.get('quantity')),
            price: Number(formData.get('price')),
            unit: formData.get('unit'),
            available: true,
            imageUrl: imageUrl,
            deliveryType: formData.get('deliveryType')
        };

        products.push(newProduct);
        showFarmerDashboard(user);
        event.target.reset();
        document.getElementById('imagePreview').style.display = 'none';
        showNotification('تم إضافة المنتج بنجاح');
    }
}


function placeOrder(event, productId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const product = products.find(p => p.id === productId);
    const quantity = Number(formData.get('quantity'));

    // التحقق من صلاحية الطلب حسب نوع المستخدم
    if (user.role === 'consumer') {
        if (quantity > 5) {
            showNotification('عذراً، الحد الأقصى للمستهلك هو 5 كيلو', 'error');
            return;
        }
    } else if (user.role === 'merchant') {
        if (quantity < 5) {
            showNotification('عذراً، الحد الأدنى للتاجر هو 5 كيلو', 'error');
            return;
        }
    }

    // التحقق من توفر الكمية
    if (quantity > product.quantity) {
        showNotification('عذراً، الكمية المطلوبة غير متوفرة', 'error');
        return;
    }

    const newOrder = {
        id: orders.length + 1,
        buyerId: user.id,
        buyerRole: user.role,
        farmerId: product.farmerId,
        product: product.product,
        quantity: quantity,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        deliveryType: product.deliveryType // إضافة نوع التوصيل للطلب
    };

    // تحديث الكمية المتوفرة
    product.quantity -= quantity;
    if (product.quantity === 0) {
        product.available = false;
    }

    orders.push(newOrder);
    showBuyerDashboard(user);
    event.target.reset();
    showNotification('تم إرسال الطلب بنجاح');
}
function updateOrderStatus(orderId, status) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        if (status === 'accepted') {
            const deliveryDays = prompt('خلال كم يوم سيتم التوصيل؟');
            if (!deliveryDays || isNaN(deliveryDays) || deliveryDays <= 0) {
                showNotification('الرجاء إدخال عدد أيام صحيح', 'error');
                return;
            }
            
            const farmer = users.find(u => u.id === order.farmerId);
            const buyer = users.find(u => u.id === order.buyerId);
            
            // Set delivery information
            order.deliveryDays = parseInt(deliveryDays);
            order.farmerPhone = farmer.phone;
            order.buyerPhone = buyer.phone;
            
            // Calculate expected delivery date
            const deliveryDate = new Date();
            deliveryDate.setDate(deliveryDate.getDate() + parseInt(deliveryDays));
            order.expectedDeliveryDate = deliveryDate.toISOString().split('T')[0];
        }
        
        order.status = status;
        const user = JSON.parse(localStorage.getItem('currentUser'));

        if (status === 'rejected') {
            const product = products.find(p => p.product === order.product);
            if (product) {
                product.quantity += order.quantity;
                product.available = true;
            }
        }

        showFarmerDashboard(user);
        showNotification(`تم ${status === 'accepted' ? 'قبول' : 'رفض'} الطلب بنجاح`);
    }
}

// دالة مساعدة لتسجيل الخروج
function logout() {
    localStorage.removeItem('currentUser');
    document.getElementById('authView').style.display = 'flex';
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('loginForm').reset();
    showNotification('تم تسجيل الخروج بنجاح');
}

// Check if user is already logged in
window.onload = function() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        showDashboard(JSON.parse(currentUser));
    }
};
// Add animation classes
document.addEventListener('DOMContentLoaded', function() {
    const elements = document.querySelectorAll('.animate-in');
    elements.forEach((el, i) => {
        el.style.animationDelay = `${i * 0.1}s`;
    });
});
/////
let currentFarmer = null;
let chats = {}; // Store chats for different farmers

// Show/hide chat based on user role after login
function initializeChat(user) {
    const chatContainer = document.getElementById('chatContainer');
    const farmerSelect = document.getElementById('farmerSelect');
    const chatInfo = document.getElementById('chatInfo');
    
    chatContainer.style.display = 'block';
    
    if (user.role === 'farmer') {
        farmerSelect.style.display = 'none';
        chatInfo.textContent = 'مرحباً بك في نظام المحادثات';
        enableChat();
    } else {
        farmerSelect.style.display = 'block';
        chatInfo.textContent = 'الرجاء اختيار فلاح للمحادثة';
    }
}

function changeFarmer(farmerId) {
    if (!farmerId) {
        disableChat();
        return;
    }
    
    currentFarmer = farmerId;
    enableChat();
    
    // Load or initialize chat history
    if (!chats[farmerId]) {
        chats[farmerId] = [{
            type: 'received',
            text: 'مرحباً بك! كيف يمكنني مساعدتك؟'
        }];
    }
    
    displayMessages(farmerId);
}

function enableChat() {
    document.getElementById('messageInput').disabled = false;
    document.getElementById('sendButton').disabled = false;
}

function disableChat() {
    document.getElementById('messageInput').disabled = true;
    document.getElementById('sendButton').disabled = true;
    document.getElementById('chatMessages').innerHTML = '<div class="message-info">الرجاء اختيار فلاح للمحادثة</div>';
}

function toggleChat() {
    const chatBox = document.getElementById('chatBox');
    chatBox.style.display = chatBox.style.display === 'none' ? 'flex' : 'none';
}

function displayMessages(farmerId) {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = chats[farmerId].map(msg => `
        <div class="message message-${msg.type}">
            ${msg.text}
        </div>
    `).join('');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (text && currentFarmer) {
        if (!chats[currentFarmer]) {
            chats[currentFarmer] = [];
        }
        
        // Add sent message
        chats[currentFarmer].push({
            type: 'sent',
            text: text
        });
        
        displayMessages(currentFarmer);
        input.value = '';

        // Simulate farmer response
        setTimeout(() => {
            chats[currentFarmer].push({
                type: 'received',
                text: 'شكراً لرسالتك! سيتم الرد عليك قريباً.'
            });
            displayMessages(currentFarmer);
        }, 1000);
    }
}

// Add event listener for Enter key
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Modify the existing handleLogin function to initialize chat
const originalHandleLogin = handleLogin;
handleLogin = function(event) {
    originalHandleLogin(event);
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        initializeChat(user);
    }
};
// re
function switchAuthTab(tab) {
    // Update tab styles
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    // Show/hide forms with fade effect
    const loginSection = document.getElementById('loginSection');
    const registerSection = document.getElementById('registerSection');
    
    if (tab === 'login') {
        registerSection.style.opacity = '0';
        setTimeout(() => {
            registerSection.style.display = 'none';
            loginSection.style.display = 'block';
            setTimeout(() => loginSection.style.opacity = '1', 50);
        }, 300);
    } else {
        loginSection.style.opacity = '0';
        setTimeout(() => {
            loginSection.style.display = 'none';
            registerSection.style.display = 'block';
            setTimeout(() => registerSection.style.opacity = '1', 50);
        }, 300);
    }
}

function handleRegister(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    if (formData.get('password') !== formData.get('confirmPassword')) {
        showNotification('كلمات المرور غير متطابقة', 'error');
        return;
    }

    if (users.some(u => u.email === formData.get('email'))) {
        showNotification('البريد الإلكتروني مستخدم بالفعل', 'error');
        return;
    }

    const newUser = {
        id: users.length + 1,
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role'),
        phone: formData.get('phone')
    };

    users.push(newUser);
    showNotification('تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول');
    switchAuthTab('login');
    event.target.reset();
}

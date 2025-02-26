// Test users
const users = [
    { 
        email: 'f1@gmail.com', 
        password: '123', 
        role: 'farmer', 
        name: 'أحمد المزارع', 
        phone: '01234567890', 
        rating: 4.5, 
        numRatings: 12,
        ratingHistory: [
            {level: 'first', value: 4.2, date: '2023-09-15'},
            {level: 'second', value: 4.5, date: '2023-12-20'},
            {level: 'third', value: 4.6, date: '2024-01-25'},
            {level: 'final', value: 4.7, date: '2024-02-15'}
        ]
    },
    { email: 'm1@gmail.com', password: '123', role: 'merchant', name: 'محمد التاجر', phone: '01234567891' },
    { email: 'c1@gmail.com', password: '123', role: 'consumer', name: 'علي المستهلك', phone: '01234567892' },
    { email: 'fa@gmail.com', password: '123', role: 'factory', name: 'مصنع الخير', phone: '01234567893' }
];
const PRODUCT_GRADES = {
    'first': 'الدرجة الأولى',
    'second': 'الدرجة الثانية',
    'third': 'الدرجة الثالثة',
    'other': 'درجة أخرى'
};
function rateFarmer(farmerId, rating, ratingLevel) {
    const farmer = users.find(u => u.id === farmerId);
    if (!farmer) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize rating history if it doesn't exist
    if (!farmer.ratingHistory) {
        farmer.ratingHistory = [];
    }
    
    // Add new rating to history
    farmer.ratingHistory.push({
        level: ratingLevel,
        value: rating,
        date: today
    });
    
    // Update overall rating
    const totalRatings = farmer.ratingHistory.length;
    const sumRatings = farmer.ratingHistory.reduce((sum, item) => sum + item.value, 0);
    farmer.rating = (sumRatings / totalRatings).toFixed(1);
    farmer.numRatings = totalRatings;
    
    // Update the UI to reflect changes
    showNotification(`تم تقييم الفلاح ${farmer.name} بنجاح`);
    
    // If user is on buyer dashboard, refresh it
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && (currentUser.role === 'merchant' || currentUser.role === 'consumer' || currentUser.role === 'factory')) {
        showBuyerDashboard(currentUser);
    }
}
// Sample data
let products = [
    { id: 1, farmerId: 1, product: 'طماطم', description: 'طماطم طازجة من المزرعة', quantity: 1000, unit: 'kg', price: 10, available: true, imageUrl: 'images/tomato.jpg', deliveryType: 'farm', grade: 'first',
        cycleStartDate: '2024-02-20' },
    { id: 2, farmerId: 1, product: 'خيار', description: 'خيار طازج عالي الجودة', quantity: 500, unit: 'kg', price: 8, available: true, imageUrl: 'images/cucumber.jpg', deliveryType: 'factory', grade: 'first', // Added grade field
        cycleStartDate: '2024-02-20' },
    { id: 3, farmerId: 1, product: 'بطاطس', description: 'بطاطس مصرية فاخرة', quantity: 2000, unit: 'kg', price: 12, available: true, imageUrl: 'images/potato.jpg', deliveryType: 'buyer' , grade: 'first', // Added grade field
        cycleStartDate: '2024-02-20'}
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
        expectedDeliveryDate: null,
        deliveryStatus: null,  // new field for tracking delivery
        rating: null,          // new field for rating
        ratingLevel: null,     // first, second, third, final
        ratingDate: null,      // when the rating was given
        cycleStartDate: null   // to track 6-month/1-year cycle
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
                    <label><i class="fas fa-star"></i> درجة المنتج</label>
                    <select name="grade" class="form-control" required>
                        <option value="first">الدرجة الأولى</option>
                        <option value="second">الدرجة الثانية</option>
                        <option value="third">الدرجة الثالثة</option>
                        <option value="other">درجة أخرى</option>
                    </select>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-calendar"></i> تاريخ بداية الدورة</label>
                    <input type="date" 
                           name="cycleStartDate" 
                           class="form-control" 
                           required
                           min="${new Date().toISOString().split('T')[0]}"
                           max="${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}">
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
                              <p><i class="fas fa-star"></i> الدرجة: ${PRODUCT_GRADES[p.grade]}</p>
                                <p><i class="fas fa-calendar"></i> تاريخ بداية الدورة: ${formatDate(p.cycleStartDate)}</p>
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
    const productsDisplayHTML = `
    <div class="product-card">
        <!-- ... existing product info ... -->
        <p><i class="fas fa-star"></i> الدرجة: ${PRODUCT_GRADES[p.grade]}</p>
        <p><i class="fas fa-calendar"></i> تاريخ بداية الدورة: ${formatDate(p.cycleStartDate)}</p>
        <!-- ... rest of the product display ... -->
    </div>
`;
}
function viewFarmerRatings(farmerId) {
    const farmer = users.find(u => u.id === farmerId);
    if (!farmer || !farmer.ratingHistory) {
        showNotification('لا توجد تقييمات لهذا الفلاح', 'warning');
        return;
    }
    
    // Create modal dialog
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2>تقييمات الفلاح: ${farmer.name}</h2>
            <div class="overall-rating">
                <p>التقييم العام: ${getRatingStars(farmer.rating)}</p>
                <p>عدد التقييمات: ${farmer.numRatings}</p>
            </div>
            <div class="rating-history">
                <h3>سجل التقييمات</h3>
                <table>
                    <thead>
                        <tr>
                            <th>المستوى</th>
                            <th>التقييم</th>
                            <th>التاريخ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${farmer.ratingHistory.map(rating => `
                            <tr>
                                <td>${getRatingLevelText(rating.level)}</td>
                                <td>${getRatingStars(rating.value)}</td>
                                <td>${formatDate(rating.date)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Add modal styles
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .modal {
            display: block;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
        }
        
        .modal-content {
            background-color: white;
            margin: 10% auto;
            padding: 20px;
            width: 80%;
            max-width: 600px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            animation: modalFadeIn 0.3s;
        }
        
        .close {
            color: #aaa;
            float: left;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
        }
        
        .close:hover {
            color: black;
        }
        
        @keyframes modalFadeIn {
            from {opacity: 0; transform: translateY(-50px);}
            to {opacity: 1; transform: translateY(0);}
        }
    `;
    document.head.appendChild(styleElement);
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
        <     <div class="card animate-in">
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
                        <th>التقييم</th>
                    </tr>
                </thead>
                <tbody>
                    ${myOrders.map(o => {
                        const farmer = users.find(u => u.id === o.farmerId);
                        return `
                        <tr>
                            <td><i class="fas fa-${getProductIcon(o.product)}"></i> ${o.product}</td>
                            <td>${o.quantity} كجم</td>
                            <td><i class="far fa-calendar"></i> ${formatDate(o.date)}</td>
                            <td><span class="status status-${o.status}">${getStatusText(o.status)}</span></td>
                            <td>
                                ${o.status === 'accepted' ? `
                                    <div class="contact-info">
                                        <p><i class="fas fa-phone"></i> رقم الفلاح: ${o.farmerPhone || 'غير متوفر'}</p>
                                        <p><i class="fas fa-user"></i> اسم الفلاح: ${farmer ? farmer.name : 'غير متوفر'}</p>
                                    </div>
                                ` : '-'}
                            </td>
                            <td>
                                ${o.status === 'accepted' ? `
                                    <div class="delivery-info">
                                        ${o.deliveryDays ? `<p><i class="fas fa-clock"></i> التوصيل خلال: ${o.deliveryDays} أيام</p>` : ''}
                                        ${o.expectedDeliveryDate ? `
                                            <p><i class="fas fa-calendar-check"></i> موعد التسليم: ${formatDate(o.expectedDeliveryDate)}</p>
                                            <p class="delivery-status ${getDeliveryStatusClass(o)}">
                                                <i class="fas fa-${getDeliveryStatusIcon(o)}"></i>
                                                ${getDeliveryStatusText(o)}
                                            </p>
                                        ` : ''}
                                    </div>
                                ` : '-'}
                            </td>
                            <td>
                                ${o.status === 'accepted' && o.expectedDeliveryDate && new Date(o.expectedDeliveryDate) < new Date() ? `
                                    ${o.rating ? `
                                        <div class="rating-display">
                                            <p><strong>تقييمك:</strong> ${getRatingStars(o.rating)}</p>
                                            <p><strong>المستوى:</strong> ${getRatingLevelText(o.ratingLevel)}</p>
                                            <p><strong>تاريخ التقييم:</strong> ${formatDate(o.ratingDate)}</p>
                                        </div>
                                    ` : `
                                        <div class="rating-form">
                                            <p><strong>قيم الفلاح:</strong></p>
                                            <div class="rating-stars">
                                                <i class="far fa-star" onclick="setRating(${o.id}, 1)"></i>
                                                <i class="far fa-star" onclick="setRating(${o.id}, 2)"></i>
                                                <i class="far fa-star" onclick="setRating(${o.id}, 3)"></i>
                                                <i class="far fa-star" onclick="setRating(${o.id}, 4)"></i>
                                                <i class="far fa-star" onclick="setRating(${o.id}, 5)"></i>
                                            </div>
                                            <div class="rating-level-selector">
                                                <select id="ratingLevel-${o.id}" class="form-control" style="margin-top: 5px;">
                                                    <option value="first">التقييم الأول</option>
                                                    <option value="second">التقييم الثاني</option>
                                                    <option value="third">التقييم الثالث</option>
                                                    <option value="final">التقييم النهائي</option>
                                                </select>
                                            </div>
                                            <button class="btn btn-sm" onclick="submitRating(${o.id})">
                                                <i class="fas fa-paper-plane"></i> إرسال التقييم
                                            </button>
                                        </div>
                                    `}
                                ` : o.status === 'accepted' ? `الرجاء الانتظار حتى اكتمال التوصيل للتقييم` : '-'}
                            </td>
                        </tr>
                    `}).join('')}
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
                                <p><i class="fas fa-star"></i> الدرجة: ${PRODUCT_GRADES[p.grade]}</p>
                                <p><i class="fas fa-calendar"></i> تاريخ بداية الدورة: ${formatDate(p.cycleStartDate)}</p>
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
                                <p><i class="fas fa-star"></i> الدرجة: ${PRODUCT_GRADES[p.grade]}</p>
                                <p><i class="fas fa-calendar"></i> تاريخ بداية الدورة: ${formatDate(p.cycleStartDate)}</p>
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
                                <p><i class="fas fa-star"></i> الدرجة: ${PRODUCT_GRADES[p.grade]}</p>
                                <p><i class="fas fa-calendar"></i> تاريخ بداية الدورة: ${formatDate(p.cycleStartDate)}</p>
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
function getRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star" style="color: gold;"></i>';
    }
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt" style="color: gold;"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star" style="color: #ccc;"></i>';
    }
    
    return stars + ` (${rating})`;
}
function getRatingLevelText(level) {
    switch(level) {
        case 'first': return 'التقييم الأول';
        case 'second': return 'التقييم الثاني';
        case 'third': return 'التقييم الثالث';
        case 'final': return 'التقييم النهائي';
        default: return 'غير محدد';
    }
}

// Track rating for order temporarily before submission
let tempRatings = {};
function setRating(orderId, rating) {
    tempRatings[orderId] = rating;
    
    // Update stars visually
    const stars = document.querySelectorAll(`.rating-form .rating-stars i`);
    for (let i = 0; i < stars.length; i++) {
        if (i < rating) {
            stars[i].className = 'fas fa-star';
            stars[i].style.color = 'gold';
        } else {
            stars[i].className = 'far fa-star';
            stars[i].style.color = '#ccc';
        }
    }
}

function submitRating(orderId) {
    if (!tempRatings[orderId]) {
        showNotification('الرجاء اختيار تقييم أولاً', 'error');
        return;
    }
    
    const order = orders.find(o => o.id === orderId);
    const levelSelect = document.getElementById(`ratingLevel-${orderId}`);
    const ratingLevel = levelSelect.value;
    
    if (!order) return;
    
    // Check if rating cycle is valid (max 1 year)
    const farmer = users.find(u => u.id === order.farmerId);
    if (farmer && farmer.ratingHistory && farmer.ratingHistory.length > 0) {
        const lastRating = farmer.ratingHistory.find(r => r.level === ratingLevel);
        if (lastRating) {
            const lastRatingDate = new Date(lastRating.date);
            const today = new Date();
            const diffMonths = (today.getFullYear() - lastRatingDate.getFullYear()) * 12 + 
                               (today.getMonth() - lastRatingDate.getMonth());
            
            if (diffMonths < 6) {
                showNotification(`لا يمكن إضافة تقييم من نفس المستوى قبل مرور 6 أشهر على الأقل`, 'error');
                return;
            } else if (diffMonths > 12) {
                showNotification(`تم تجاوز الحد الأقصى للدورة (سنة واحدة). سيتم إعادة تعيين التقييمات السابقة`, 'warning');
                // Reset previous ratings of this level
                farmer.ratingHistory = farmer.ratingHistory.filter(r => r.level !== ratingLevel);
            }
        }
    }
    
    // Update order with rating
    order.rating = tempRatings[orderId];
    order.ratingLevel = ratingLevel;
    order.ratingDate = new Date().toISOString().split('T')[0];
    
    // Update farmer's overall rating
    rateFarmer(order.farmerId, order.rating, ratingLevel);
    
    // Clear temporary ratings
    delete tempRatings[orderId];
    
    // Refresh the dashboard
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    showBuyerDashboard(currentUser);
}
function getDeliveryStatusText(order) {
    if (!order.expectedDeliveryDate) return '';
    
    const today = new Date();
    const deliveryDate = new Date(order.expectedDeliveryDate);
    
    if (order.deliveryStatus === 'completed') {
        return 'تم التسليم';
    } else if (order.deliveryStatus === 'delayed') {
        return 'تأخير في التسليم';
    } else if (today > deliveryDate) {
        if (Math.floor((today - deliveryDate) / (1000 * 60 * 60 * 24)) <= 3) {
            return 'متأخر (أقل من 3 أيام)';
        } else {
            return 'متأخر بشكل كبير';
        }
    } else if (today.toDateString() === deliveryDate.toDateString()) {
        return 'اليوم';
    } else {
        const diffDays = Math.ceil((deliveryDate - today) / (1000 * 60 * 60 * 24));
        return `متبقي ${diffDays} يوم`;
    }
}

function getDeliveryStatusClass(order) {
    if (!order.expectedDeliveryDate) return '';
    
    const today = new Date();
    const deliveryDate = new Date(order.expectedDeliveryDate);
    
    if (order.deliveryStatus === 'completed') {
        return 'status-completed';
    } else if (order.deliveryStatus === 'delayed') {
        return 'status-delayed';
    } else if (today > deliveryDate) {
        const diffDays = Math.floor((today - deliveryDate) / (1000 * 60 * 60 * 24));
        if (diffDays <= 3) {
            return 'status-slight-delay';
        } else {
            return 'status-major-delay';
        }
    } else if (today.toDateString() === deliveryDate.toDateString()) {
        return 'status-today';
    } else {
        return 'status-pending';
    }
}

function getDeliveryStatusIcon(order) {
    if (!order.expectedDeliveryDate) return '';
    
    const today = new Date();
    const deliveryDate = new Date(order.expectedDeliveryDate);
    
    if (order.deliveryStatus === 'completed') {
        return 'check-circle';
    } else if (order.deliveryStatus === 'delayed') {
        return 'exclamation-triangle';
    } else if (today > deliveryDate) {
        return 'clock';
    } else if (today.toDateString() === deliveryDate.toDateString()) {
        return 'truck';
    } else {
        return 'calendar-alt';
    }
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
    
    // Get selected grade
    const grade = formData.get('grade');
    
    // Get and validate cycle start date
    const cycleStartDate = formData.get('cycleStartDate');
    const today = new Date();
    const selectedDate = new Date(cycleStartDate);
    const oneYearFromToday = new Date();
    oneYearFromToday.setFullYear(today.getFullYear() + 1);
    
    // Validate cycle date
    if (selectedDate > oneYearFromToday) {
        showNotification('تاريخ الدورة لا يمكن أن يتجاوز سنة من اليوم', 'error');
        return;
    }
    
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
                deliveryType: formData.get('deliveryType'),
                grade: grade, // Add grade
                cycleStartDate: cycleStartDate // Add cycle start date
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
            deliveryType: formData.get('deliveryType'),
            grade: grade, // Add grade
            cycleStartDate: cycleStartDate // Add cycle start date
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
            
            // Set initial delivery status
            order.deliveryStatus = 'pending';
            order.cycleStartDate = new Date().toISOString().split('T')[0];
        } else if (status === 'delivered') {
            order.deliveryStatus = 'completed';
            // Enable rating capability
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
        showNotification(`تم ${getStatusActionText(status)} الطلب بنجاح`);
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
function getStatusActionText(status) {
    switch(status) {
        case 'accepted': return 'قبول';
        case 'rejected': return 'رفض';
        case 'delivered': return 'تأكيد تسليم';
        case 'delayed': return 'تسجيل تأخير';
        default: return 'تحديث حالة';
    }
}
document.addEventListener('DOMContentLoaded', function() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .rating-display, .rating-form {
            padding: 10px;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        
        .rating-stars {
            font-size: 1.2em;
            direction: ltr;
            text-align: center;
            margin: 10px 0;
        }
        
        .rating-stars i {
            cursor: pointer;
            margin: 0 2px;
        }
        
        .rating-level-selector {
            margin: 10px 0;
        }
        
        .btn-sm {
            padding: 5px 10px;
            font-size: 0.9em;
        }
        
        .delivery-status {
            font-weight: bold;
            padding: 3px 7px;
            border-radius: 4px;
            display: inline-block;
            margin-top: 5px;
        }
        
        .status-completed {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status-delayed, .status-major-delay {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .status-slight-delay {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .status-today {
            background-color: #cce5ff;
            color: #004085;
        }
        
        .status-pending {
            background-color: #e2e3e5;
            color: #383d41;
        }
    `;
    document.head.appendChild(styleElement);
});
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
   // كود التحميل المحسن
   document.addEventListener('DOMContentLoaded', function() {
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingBar = document.querySelector('.loading-bar');
    const loadingPercentage = document.querySelector('.loading-percentage');
    
    // محاكاة تقدم التحميل
    let progress = 0;
    const interval = setInterval(function() {
        progress += Math.random() * 10;
        if (progress > 100) progress = 100;
        
        // تحديث النسبة المئوية
        loadingPercentage.textContent = Math.round(progress) + '%';
        
        // عند اكتمال التحميل
        if (progress >= 100) {
            clearInterval(interval);
            
            // إضافة متعة بصرية إضافية عند الانتهاء
            document.querySelectorAll('.plant').forEach(plant => {
                plant.style.filter = 'brightness(1.2)';
            });
            
            // إخفاء شاشة التحميل بعد اكتمال التحميل
            setTimeout(function() {
                loadingScreen.style.animation = 'fadeOut 0.8s forwards';
                setTimeout(function() {
                    loadingScreen.classList.add('hidden');
                }, 800);
            }, 1000);
        }
    }, 150);
    
    // معالجة الرسومات المتحركة للأوراق
    document.querySelectorAll('.leaf.right').forEach(leaf => {
        leaf.style.animation = 'growLeafRight 0.5s ease forwards 0.6s';
    });
});
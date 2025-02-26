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
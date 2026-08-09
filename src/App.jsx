import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Trash2, 
  LayoutDashboard,
  Store,
  Camera,
  UploadCloud,
  Loader2
} from 'lucide-react';

function App() {
  const [shoes, setShoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('store');

  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // حالات الإضافة والأدمن
  const [newShoe, setNewShoe] = useState({ name: '', price: '', tag: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchShoes = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://backenddemo-nlkq.onrender.com/api/shoes');
      const result = await response.json();
      if (result.success) setShoes(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShoes();
  }, []);

  // اختيار الصورة من الجوال أو الكاميرا
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // رفع الصورة وإضافة الحذاء
  const handleAddShoe = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('الرجاء التقاط أو اختيار صورة الحذاء أولاً');
      return;
    }

    setUploading(true);
    try {
      // 1. رفع الصورة للسيرفر
      const formData = new FormData();
      formData.append('image', selectedFile);

      const uploadRes = await fetch('https://backenddemo-nlkq.onrender.com/api/upload', {
  method: 'POST',
  body: formData,
});
      const uploadData = await uploadRes.json();

      if (!uploadData.success) throw new Error(uploadData.message);

      // 2. حفظ بيانات الحذاء بالرابط الجديد
      const shoeData = {
        name: newShoe.name,
        price: newShoe.price,
        tag: newShoe.tag,
        image: uploadData.url
      };

      const res = await fetch('https://backenddemo-nlkq.onrender.com/api/shoes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(shoeData)
});

      const data = await res.json();

      if (data.success) {
        fetchShoes();
        setNewShoe({ name: '', price: '', tag: '' });
        setSelectedFile(null);
        setPreviewUrl('');
        alert('تم رفع الصورة وإضافة الحذاء بنجاح!');
      }
    } catch (err) {
      alert('فشل في رفع الصورة، تأكد من إنشاء bucket اسمه shoes في Supabase');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteShoe = async (id) => {
    if (!window.confirm('هل أنت تأكد من حذف هذا الحذاء؟')) return;
    try {
      const res = await fetch(`https://backenddemo-nlkq.onrender.com/api/shoes/${id}`, {
  method: 'DELETE'
});
      const data = await res.json();
      if (data.success) fetchShoes();
    } catch (err) {
      alert('فشل في الحذف');
    }
  };

  const addToCart = (shoe) => {
    setCart((prev) => {
      const exist = prev.find((x) => x.id === shoe.id);
      if (exist) return prev.map((x) => x.id === shoe.id ? { ...x, quantity: x.quantity + 1 } : x);
      return [...prev, { ...shoe, quantity: 1 }];
    });
  };

  const filteredShoes = shoes.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-2.5 rounded-2xl text-slate-950 font-bold">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-amber-500">ClassyMan Store</h1>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView(view === 'store' ? 'admin' : 'store')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-sm border border-slate-700 font-bold transition"
            >
              {view === 'store' ? <LayoutDashboard className="w-4 h-4 text-amber-500" /> : <Store className="w-4 h-4 text-amber-500" />}
              {view === 'store' ? 'لوحة التحكم' : 'عرض المتجر'}
            </button>

            {view === 'store' && (
              <button 
                onClick={() => setIsCartOpen(true)}
                className="bg-amber-500 text-slate-950 px-4 py-2 rounded-xl font-bold flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>({cart.reduce((a, b) => a + b.quantity, 0)})</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {view === 'store' ? (
          <>
            <div className="mb-8">
              <input 
                type="text"
                placeholder="ابحث عن حذاء..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 text-slate-200"
              />
            </div>

            {loading ? (
              <div className="text-center py-20 text-slate-400">جاري التحميل...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredShoes.map((shoe) => (
                  <div key={shoe.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-4 flex flex-col justify-between">
                    <img src={shoe.image} alt={shoe.name} className="h-52 w-full object-cover rounded-xl mb-4 bg-slate-950" />
                    <div>
                      <h3 className="font-bold text-lg">{shoe.name}</h3>
                      <p className="text-amber-400 font-bold text-xl my-2">{shoe.price} ₪</p>
                    </div>
                    <button 
                      onClick={() => addToCart(shoe)}
                      className="w-full bg-amber-500 text-slate-950 font-bold py-2 rounded-xl mt-2 hover:bg-amber-400 transition"
                    >
                      إضافة للسلة
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Admin View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 h-fit">
              <h2 className="text-lg font-bold text-amber-500 mb-4">إضافة حذاء جديد</h2>
              <form onSubmit={handleAddShoe} className="space-y-4">
                <input 
                  type="text" placeholder="اسم الحذاء" required
                  value={newShoe.name} onChange={(e) => setNewShoe({...newShoe, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200"
                />
                <input 
                  type="number" placeholder="السعر (₪)" required
                  value={newShoe.price} onChange={(e) => setNewShoe({...newShoe, price: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200"
                />
                <input 
                  type="text" placeholder="التايج (مثال: جديد / الأكثر مبيعاً)"
                  value={newShoe.tag} onChange={(e) => setNewShoe({...newShoe, tag: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200"
                />

                {/* Input الكاميرا والملفات */}
                <div className="border-2 border-dashed border-slate-800 rounded-2xl p-4 text-center hover:border-amber-500/50 transition">
                  {previewUrl ? (
                    <div className="relative">
                      <img src={previewUrl} alt="المعاينة" className="h-40 w-full object-cover rounded-xl mb-3" />
                      <label htmlFor="file-upload" className="cursor-pointer text-xs text-amber-400 underline">
                        تغيير الصورة
                      </label>
                    </div>
                  ) : (
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2 py-4">
                      <div className="bg-slate-800 p-3 rounded-full text-amber-500">
                        <Camera className="w-6 h-6" />
                      </div>
                      <span className="text-xs text-slate-300 font-bold">التقط صورة بالكاميرا أو اختر من الجوال</span>
                      <span className="text-[10px] text-slate-500">PNG, JPG, WEBP</span>
                    </label>
                  )}
                  <input 
                    id="file-upload"
                    type="file" 
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={uploading}
                  className="w-full bg-amber-500 text-slate-950 font-bold py-3 rounded-xl hover:bg-amber-400 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري رفع الصورة والمنتج...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-5 h-5" />
                      حفظ ونشر الحذاء
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h2 className="text-lg font-bold text-slate-100 mb-4">الأحذية الحالية ({shoes.length})</h2>
              <div className="space-y-3">
                {shoes.map((shoe) => (
                  <div key={shoe.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <img src={shoe.image} alt={shoe.name} className="w-12 h-12 rounded-lg object-cover bg-slate-900" />
                      <div>
                        <p className="font-semibold text-sm">{shoe.name}</p>
                        <p className="text-xs text-amber-400">{shoe.price} ₪</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteShoe(shoe.id)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
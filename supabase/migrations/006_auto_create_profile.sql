-- Bu policy hatası muhtemelen yeni kullanıcının id'si ile auth.uid()
-- tam eşleşmediği için veya RLS'in henüz authenticated context'i tam algılamaması yüzünden olabilir.
-- Ancak daha güvenli ve kesin çözüm TRIGGER kullanmaktır.
-- Supabase Auth kullanıcısı oluştuğunda otomatik olarak Profile da oluşsun.

-- 1. Önce eski manuel profili oluşturma kodunu SignupForm.tsx'den kaldıracağız (sonraki adımda).
-- 2. Şimdi bu SQL'i çalıştırın:

-- Function to confirm user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

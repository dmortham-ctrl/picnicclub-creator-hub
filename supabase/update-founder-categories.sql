update public.profiles
set category = case username
  when 'inproduk' then 'Elektronik'
  when 'bertosb1m' then 'Education'
  when 'adli.hibatul' then 'Elektronik'
  when 'aditsur88' then 'Fashion'
  when 'sobatkaryawan' then 'Fashion'
end,
updated_at = now()
where username in ('inproduk', 'bertosb1m', 'adli.hibatul', 'aditsur88', 'sobatkaryawan');

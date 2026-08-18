-- IPMA 관리자 사진 조회 정책
-- SQL Editor에서 1회 실행
drop policy if exists "IPMA admin read member photos" on storage.objects;

create policy "IPMA admin read member photos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'ipma-member-photos'
  and (auth.jwt() ->> 'email') = 'jeonseongkweon@gmail.com'
);

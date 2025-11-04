# Sử dụng image Node 18-alpine làm cơ sở
FROM node:18-alpine

# Đặt thư mục làm việc là /app
WORKDIR /app

# Sao chép package.json và package-lock.json (nếu có)
COPY package*.json ./

# Chạy "npm ci" (clean install) để cài đặt dependencies
# "ci" nhanh hơn và an toàn hơn "install" cho môi trường build
RUN npm ci

# Sao chép phần còn lại của mã nguồn
COPY . .

# Thông báo rằng ứng dụng sẽ chạy trên cổng 3000
EXPOSE 3000

# Lệnh mặc định để chạy ứng dụng
CMD [ "node", "server.js" ]
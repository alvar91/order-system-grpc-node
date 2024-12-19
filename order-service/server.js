const grpc = require('@grpc/grpc-js'); // Подключаем модуль gRPC для работы с gRPC-сервисами.
const protoLoader = require('@grpc/proto-loader'); // Подключаем модуль для загрузки файлов .proto.
const { v4: uuidv4 } = require('uuid'); // Подключаем модуль UUID и используем v4 для генерации уникальных ID.

const path = require('path'); // Подключаем модуль path для работы с файловыми путями.
const PROTO_PATH = path.join(__dirname, './order.proto'); // Устанавливаем путь к файлу order.proto.

const packageDefinition = protoLoader.loadSync(PROTO_PATH); // Загружаем определение протокола из файла .proto.
const orderProto = grpc.loadPackageDefinition(packageDefinition).order; // Загружаем объект order из определений пакета.

const orders = []; // Инициализируем массив для хранения заказов.

const server = new grpc.Server(); // Создаем новый gRPC-сервер.

server.addService(orderProto.OrderService.service, { // Добавляем сервис OrderService на сервер.
  CreateOrder: (call, callback) => { // Определяем метод CreateOrder для создания заказа.
    const order = { // Создаем объект нового заказа.
      orderId: uuidv4(), // Генерируем уникальный ID заказа.
      userId: call.request.userId, // Получаем ID пользователя из запроса.
      productName: call.request.productName, // Получаем название продукта из запроса.
      quantity: call.request.quantity, // Получаем количество продукта из запроса.
    };
    orders.push(order); // Добавляем новый заказ в массив orders.
    callback(null, order); // Возвращаем созданный заказ клиенту.
  },
  GetOrder: (call, callback) => { // Определяем метод GetOrder для получения заказа.
    const order = orders.find(o => o.orderId === call.request.orderId); // Ищем заказ по ID.
    if (order) { // Если заказ найден:
      callback(null, order); // Возвращаем найденный заказ клиенту.
    } else { // Если заказ не найден:
      callback({ // Возвращаем ошибку:
        code: grpc.status.NOT_FOUND, // Код ошибки NOT_FOUND.
        details: "Order not found", // Сообщение об ошибке.
      });
    }
  },
});

server.bindAsync( // Привязываем сервер к указанному адресу и порту.
  '0.0.0.0:5002', // Указываем адрес и порт для сервера.
  grpc.ServerCredentials.createInsecure(), // Используем небезопасные учетные данные.
  () => { // Коллбек для подтверждения запуска сервера.
    console.log('Order Service running on port 5002'); // Выводим сообщение о запуске сервера.
  }
); // Завершаем настройку сервера.

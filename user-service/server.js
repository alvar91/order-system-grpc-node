const grpc = require('@grpc/grpc-js'); // Подключаем модуль gRPC для работы с gRPC-сервисами.
const protoLoader = require('@grpc/proto-loader'); // Подключаем модуль для загрузки файлов .proto.
const { v4: uuidv4 } = require('uuid'); // Импортируем функцию v4 из модуля UUID для генерации уникальных идентификаторов.

const path = require('path'); // Подключаем модуль path для работы с файловыми путями.
const PROTO_PATH = path.join(__dirname, './user.proto'); // Устанавливаем путь к файлу user.proto в текущей директории.

const packageDefinition = protoLoader.loadSync(PROTO_PATH); // Загружаем определение протокола из файла .proto.
const userProto = grpc.loadPackageDefinition(packageDefinition).user; // Загружаем объект user из определений пакета.

const users = []; // Инициализируем массив для хранения пользователей.

const server = new grpc.Server(); // Создаем экземпляр gRPC-сервера.

server.addService(userProto.UserService.service, { // Добавляем сервис UserService и его методы на сервер.
  CreateUser: (call, callback) => { // Реализуем метод CreateUser для создания пользователя.
    const user = { // Создаем объект нового пользователя.
      userId: uuidv4(), // Генерируем уникальный ID для пользователя.
      name: call.request.name, // Извлекаем имя из запроса.
      email: call.request.email, // Извлекаем email из запроса.
    };
    users.push(user); // Добавляем нового пользователя в массив users.
    callback(null, user); // Возвращаем созданного пользователя в ответе.
  },
  GetUser: (call, callback) => { // Реализуем метод GetUser для получения информации о пользователе.
    const user = users.find(u => u.userId === call.request.userId); // Ищем пользователя в массиве по ID.
    if (user) { // Если пользователь найден:
      callback(null, user); // Возвращаем найденного пользователя в ответе.
    } else { // Если пользователь не найден:
      callback({ // Возвращаем ошибку:
        code: grpc.status.NOT_FOUND, // Устанавливаем код ошибки как NOT_FOUND.
        details: "User not found", // Указываем сообщение об ошибке.
      });
    }
  },
});

server.bindAsync( // Настраиваем сервер на привязку к указанному адресу и порту.
  '0.0.0.0:5001', // Указываем адрес и порт для сервера.
  grpc.ServerCredentials.createInsecure(), // Используем небезопасные учетные данные для сервера.
  () => { // Коллбек, вызываемый после успешной привязки.
    console.log('User Service running on port 5001'); // Выводим сообщение о запуске сервера.
  }
); // Завершаем настройку сервера.
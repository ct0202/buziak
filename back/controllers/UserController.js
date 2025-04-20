const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Регистрация
exports.register = async (req, res) => {
  try {
    const { name, phone, email, password, gender } = req.body;
    
    // Проверяем существование email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email уже занят" });
    }

    // Проверяем существование телефона
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Телефон уже занят" });
    }

    const user = new User({ name, phone, email, password, gender });
    await user.save();

    res.status(201).json({ message: "Регистрация успешна" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
};

// Логин
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Неверные данные" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user });  
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
};

// Забыл пароль
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 час
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`;

    await sendEmail({
      to: user.email,
      subject: "Сброс пароля",
      text: `Нажмите на ссылку, чтобы сбросить пароль: ${resetURL}`,
    });

    res.json({ message: "Ссылка для сброса отправлена на email" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
};

// exports.updateProfile = async (req, res) => {
//   try {
//     const { update, data } = req.body;

//     const user = await User.findByIdAndUpdate(req.user._id, { name, phone, email, password, gender }, { new: true });

//     res.json({ message: "Профиль успешно обновлён" });
//   }
// }

// Сброс пароля
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Недействительный или истекший токен" });

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Пароль успешно обновлён" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
};


// Сброс пароля
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Недействительный или истекший токен" });

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Пароль успешно обновлён" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
};

        if (user.avatar) {
            try {
                avatarUrl = await s3.getSignedUrlPromise('getObject', {
                    Bucket: BUCKET_NAME,
                    Key: user.avatar,
                    Expires: 3600
                });
            } catch (error) {
                console.error('Ошибка при генерации URL для аватара:', error);
            }
        }

        res.json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                photos: photosWithUrls,
                avatar: avatarUrl ? { key: user.avatar, url: avatarUrl } : null
            }
        });
    } catch (error) {
        console.error('Ошибка при получении информации о пользователе:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Получение всех пользователей
export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        const usersWithPhotos = await Promise.all(
            users.map(async (user) => {
                let avatarUrl = null;
                if (user.avatar) {
                    avatarUrl = await s3.getSignedUrlPromise('getObject', {
                        Bucket: BUCKET_NAME,
                        Key: user.avatar,
                        Expires: 3600
                    });
                }

                const photos = await Promise.all(
                    user.photos.map(async (photo) => {
                        const url = await s3.getSignedUrlPromise('getObject', {
                            Bucket: BUCKET_NAME,
                            Key: photo,
                            Expires: 3600
                        });
                        return { key: photo, url };
                    })
                );

                return {
                    ...user.toObject(),
                    avatar: user.avatar ? { key: user.avatar, url: avatarUrl } : null,
                    photos
                };
            })
        );

        res.json(usersWithPhotos);
    } catch (error) {
        console.error('Ошибка при получении пользователей:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Получение пользователя по ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        let avatarUrl = null;
        if (user.avatar) {
            avatarUrl = await s3.getSignedUrlPromise('getObject', {
                Bucket: BUCKET_NAME,
                Key: user.avatar,
                Expires: 3600
            });
        }

        const photos = await Promise.all(
            user.photos.map(async (photo) => {
                const url = await s3.getSignedUrlPromise('getObject', {
                    Bucket: BUCKET_NAME,
                    Key: photo,
                    Expires: 3600
                });
                return { key: photo, url };
            })
        );

        res.json({
            ...user.toObject(),
            avatar: user.avatar ? { key: user.avatar, url: avatarUrl } : null,
            photos
        });
    } catch (error) {
        console.error('Ошибка при получении пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Обновление пользователя
export const updateUser = async (req, res) => {
    try {
        const { name, age, gender, lookingFor, bio } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        user.name = name || user.name;
        user.age = age || user.age;
        user.gender = gender || user.gender;
        user.lookingFor = lookingFor || user.lookingFor;
        user.bio = bio || user.bio;

        await user.save();

        let avatarUrl = null;
        if (user.avatar) {
            avatarUrl = await s3.getSignedUrlPromise('getObject', {
                Bucket: BUCKET_NAME,
                Key: user.avatar,
                Expires: 3600
            });
        }

        const photos = await Promise.all(
            user.photos.map(async (photo) => {
                const url = await s3.getSignedUrlPromise('getObject', {
                    Bucket: BUCKET_NAME,
                    Key: photo,
                    Expires: 3600
                });
                return { key: photo, url };
            })
        );

        res.json({
            ...user.toObject(),
            password: undefined,
            avatar: user.avatar ? { key: user.avatar, url: avatarUrl } : null,
            photos
        });
    } catch (error) {
        console.error('Ошибка при обновлении пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Сброс пароля
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Недействительный или истекший токен" });

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Пароль успешно обновлён" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
};

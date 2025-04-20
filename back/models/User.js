import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // Основная информация
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ["male", "female"], required: true },
    birthDay: { type: Date },
    isAdmin: { type: Boolean, default: false },
    age: { type: Number },

    // Геолокация
    country: { type: String },
    city: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },

    // Профиль
    aboutMe: { type: String },
    photos: {
        type: [String],
        default: Array(9).fill(null),
        validate: {
            validator: function(array) {
                return array.length === 9;
            },
            message: 'Массив фотографий должен содержать ровно 9 элементов'
        }
    },
    photoUrls: [{
        position: Number,
        url: String,
        key: String
    }],
    verificationPhoto: { type: String, default: null },
    verified: { type: Boolean, default: false },

    // Настройки
    whoSeesMyProfile: { type: String, enum: ["GIRL", "MAN", "ALL"] },
    language: { type: String, enum: ["EN", "PL"] },
    lookingFor: { type: String, enum: ["GIRL", "MAN"] },
    purpose: { type: String },
    showOnlyWithPhoto: { type: Boolean, default: false },

    // Безопасность
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },

    // Финансы
    balance: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Хэширование пароля перед сохранением
userSchema.pre("save", async function (next) {
  // Хешируем пароль только если он был изменен
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Метод для сравнения паролей
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;

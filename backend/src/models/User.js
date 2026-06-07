const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_, obj) => {
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    delete obj.password;
    return obj;
  },
});

module.exports = model('User', userSchema);

import nodemailer from "nodemailer";

export const emailRegistro = async (datos) => {
  const { email, nombre, token } = datos;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  //*Información del Email
  const info = await transport.sendMail({
    from: "UpTAsk - Administrador <admin@gmail.com>",
    to: email,
    subject: "Uptask - Confirma Tu Cuenta",
    text: "Confirma tu Cuenta en UpTask",
    html: `<p>Hola: ${nombre} confirma tu cuenta en Uptask</p>
      <p>Tu Cuenta ya esta casi lista, solo debes confirmar tu cuenta en el siguiente enlace</p>
      <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Confirmar Cuenta</a>
      <p>Si no creaste esta cuenta, Ignora este mensaje</p>
    `,
  });
};

export const emailOlvidePassword = async (datos) => {
  const { email, nombre, token } = datos;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  //*Información del Email

  const info = await transport.sendMail({
    from: "UpTAsk - Administrador <admin@gmail.com>",
    to: email,
    subject: "Uptask - Reestablece Tu Contraseña",
    text: "Reestablece tu Contraseña en UpTask",
    html: `<p>Hola: ${nombre} Reestablece tu Contraseña en Uptask</p>
      <p>Reestablece tu Contraseña en el siguiente enlace</p>
      <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Contraseña</a>
    `,
  });
};

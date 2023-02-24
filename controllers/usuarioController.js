import { emailRegistro, emailOlvidePassword } from "../helpers/email.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import Usuario from "../models/Usuario.js";

const registrar = async (req, res) => {
  //*Evitar Registros Duplicados

  const { email } = req.body;

  const existeUsuario = await Usuario.findOne({ email });

  if (existeUsuario) {
    const error = new Error("Usuario ya Registrado");
    return res.status(400).json({ msg: error.message });
  }

  try {
    const usuario = new Usuario(req.body);
    usuario.token = generarId();
    await usuario.save();

    //*Evniar Email
    emailRegistro({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    });

    res.json({
      msg: "Usuario Creado Correctamente, Revisa tu Email para confirmar la Cuenta",
    });
  } catch (e) {
    console.log(e);
  }
};

const autenticar = async (req, res) => {
  const { email, password } = req.body;

  //* Comprobar que el usuario Exista
  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    const error = new Error("El Usuario No Existe");
    return res.status(404).json({ msg: error.message });
  }
  //* Comprobar que el usuario este Confirmada
  if (!usuario.confirmado) {
    const error = new Error("Tu Cuenta no ha sida Confirmada");
    return res.status(404).json({ msg: error.message });
  }
  //*Comprobar Password
  if (await usuario.comprobarPassword(password)) {
    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      token: generarJWT(usuario._id),
    });
  } else {
    const error = new Error("El password es Incorrecto");
    return res.status(403).json({ msg: error.message });
  }
};

const confirmar = async (req, res) => {
  const { token } = req.params;
  const usuarioConfirmar = await Usuario.findOne({ token });
  if (!usuarioConfirmar) {
    const error = new Error("Token No Válido");
    return res.status(403).json({ msg: error.message });
  }

  try {
    usuarioConfirmar.confirmado = true;
    usuarioConfirmar.token = "";
    await usuarioConfirmar.save();
    res.json({ msg: "Usuario Confirmado Correctamente" });
    console.log(usuarioConfirmar);
  } catch (e) {
    console.log(e);
  }
};

const olvidePassword = async (req, res) => {
  const { email } = req.body;

  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    const error = new Error("El Usuario No Existe");
    return res.status(404).json({ msg: error.message });
  }
  try {
    usuario.token = generarId();
    await usuario.save();

    //*Enviar el Email

    emailOlvidePassword({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    });

    res.json({ msg: "Hemos Enviado Un Correo Con las Instrucciones" });
  } catch (e) {
    console.log(error);
  }
};

const comprobarToken = async (req, res) => {
  const { token } = req.params;

  const tokenValido = await Usuario.findOne({ token });

  if (tokenValido) {
    res.json({ msg: "Token Válido y el usuario Existe " });
  } else {
    const error = new Error("Token No Válido");
    return res.status(404).json({ msg: error.message });
  }
};

const nuevoPassword = async (req, res) => {
  const { token } = req.params;

  const { password } = req.body;

  const usuario = await Usuario.findOne({ token });

  if (usuario) {
    usuario.password = password;
    usuario.token = "";
    try {
      await usuario.save();
      res.json({ msg: "Password Modificado Correctamente!" });
    } catch (e) {
      console.log(e);
    }
  } else {
    const error = new Error("Token No Válido");
    return res.status(404).json({ msg: error.message });
  }
};

const perfil = async (req, res) => {
  const { usuario } = req;
  res.json(usuario);
};

export {
  registrar,
  autenticar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
};

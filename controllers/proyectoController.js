import Proyecto from "../models/Proyecto.js";
import Usuario from "../models/Usuario.js";

const obtenerProyectos = async (req, res) => {
  const proyectos = await Proyecto.find({
    $or: [
      { colaboradores: { $in: req.usuario } },
      { creador: { $in: req.usuario } },
    ],
  })
    // .where("creador")
    // .equals(req.usuario)
    .select("-tareas");
  res.json(proyectos);
};
const nuevoProyecto = async (req, res) => {
  const proyecto = new Proyecto(req.body);
  proyecto.creador = req.usuario._id;

  try {
    const proyectoAlmacenado = await proyecto.save();

    res.json({ proyectoAlmacenado });
  } catch (e) {
    console.log(e);
  }
};
const obtenerProyecto = async (req, res) => {
  const { id } = req.params;
  const proyecto = await Proyecto.findById(id)
    .populate({
      path: "tareas",
      populate: { path: "completado", select: "nombre" },
    })
    .populate("colaboradores", "nombre email");
  if (!proyecto) {
    const error = new Error("Proyecto No Encontrado");
    return res.status(404).json({ msg: error.message });
  }
  if (
    proyecto.creador.toString() !== req.usuario._id.toString() &&
    !proyecto.colaboradores.some(
      (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
    )
  ) {
    const error = new Error("Acción no Válida");
    return res.status(401).json({ msg: error.message });
  }

  //*Obtener tareas del Proyecto
  //const tareas = await Tarea.find().where("proyecto").equals(proyecto._id);

  res.json(proyecto);
};
const editarProyecto = async (req, res) => {
  const { id } = req.params;
  const proyecto = await Proyecto.findById(id);
  if (!proyecto) {
    const error = new Error("Proyecto No Encontrado");
    return res.status(404).json({ msg: error.message });
  }
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no Válida");
    return res.status(401).json({ msg: error.message });
  }

  proyecto.nombre = req.body.nombre || proyecto.nombre;
  proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
  proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
  proyecto.cliente = req.body.cliente || proyecto.cliente;

  try {
    const proyectoAlmacenado = await proyecto.save();
    res.json(proyectoAlmacenado);
  } catch (e) {
    console.log(e);
  }
};
const eliminarProyecto = async (req, res) => {
  const { id } = req.params;
  const proyecto = await Proyecto.findById(id);
  if (!proyecto) {
    const error = new Error("Proyecto No Encontrado");
    return res.status(404).json({ msg: error.message });
  }
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no Válida");
    return res.status(401).json({ msg: error.message });
  }
  try {
    await proyecto.deleteOne();
    res.json({ msg: "Proyecto Eliminado" });
  } catch (e) {
    console.log(e);
  }
};
const buscarColaborador = async (req, res) => {
  const { email } = req.body;

  const usuario = await Usuario.findOne({ email }).select(
    "-confirmado -createdAt -password -token -updatedAt -__v"
  );

  if (!usuario) {
    const error = new Error("Usuario no Encontrado!");
    return res.status(404).json({ msg: error.message });
  }

  res.json(usuario);
};
const agregarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);

  //*Verificar que el proyecto exista
  if (!proyecto) {
    const error = new Error("Proyecto No Encontrado!");
    return res.status(404).json({ msg: error.message });
  }

  //*Tenga los permisos
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no Válida!");
    return res.status(404).json({ msg: error.message });
  }

  //*Verificar que el usuario Exista
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email }).select(
    "-confirmado -createdAt -password -token -updatedAt -__v"
  );
  if (!usuario) {
    const error = new Error("Usuario no Encontrado!");
    return res.status(404).json({ msg: error.message });
  }

  //*El Colaborador no es admin del proyecto
  if (proyecto.creador.toString() === usuario._id.toString()) {
    const error = new Error(
      "El Creador del Proyecto no Puede Ser Colaborador!"
    );
    return res.status(404).json({ msg: error.message });
  }

  //* Revisar que no este ya agregado al proyecto
  if (proyecto.colaboradores.includes(usuario._id)) {
    const error = new Error("El Usuario ya pertenece al Proyecto!");
    return res.status(404).json({ msg: error.message });
  }

  //*Argegamos

  proyecto.colaboradores.push(usuario._id);
  await proyecto.save();
  res.json({ msg: "Colaborador Agregado Correctamente" });
};
const ellminarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);

  //*Verificar que el proyecto exista
  if (!proyecto) {
    const error = new Error("Proyecto No Encontrado!");
    return res.status(404).json({ msg: error.message });
  }

  //*Tenga los permisos
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no Válida!");
    return res.status(404).json({ msg: error.message });
  }

  //*Se Elimina
  proyecto.colaboradores.pull(req.body.id);
  await proyecto.save();
  res.json({ msg: "Colaborador Eliminado Correctamente" });
};

// const obtenerTareas = async (req, res) => {
//   const { id } = req.params;

//   const existeProyecto = await Proyecto.findById(id);

//   if (!existeProyecto) {
//     const error = new Error("No Encontrado");
//     return res.status(404).json({
//       msg: error.message,
//     });
//   }

//   //* Tienes que ser el creador del Proyecto o colaborador

//   const tareas = await Tarea.find().where("proyecto").equals(id);
//   res.json({ tareas });
// };

export {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  buscarColaborador,
  agregarColaborador,
  ellminarColaborador,
  // obtenerTareas,
};

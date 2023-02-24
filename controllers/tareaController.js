import mongoose from "mongoose";

import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";

const agregarTarea = async (req, res) => {
  const { proyecto } = req.body;
  const existeProyecto = await Proyecto.findById(proyecto);
  if (!existeProyecto) {
    const error = new Error("El Proyecto no Existe");
    return res.status(404).json({
      msg: error.message,
    });
  }
  if (mongoose.Types.ObjectId.isValid(req.usuario._id)) {
    if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("No Tienes los Permisos para añadir tareas");
      return res.status(403).json({
        msg: error.message,
      });
    }
  }

  try {
    const tareaAlmacenada = await Tarea.create(req.body);
    //*Almacenar el ID de tareas en el proyecto (arreglo de tareas)
    existeProyecto.tareas.push(tareaAlmacenada._id);
    await existeProyecto.save();
    res.json(tareaAlmacenada);
  } catch (e) {
    console.log(e);
  }
};
const obtenerTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate("proyecto");

  if (!tarea) {
    const error = new Error("Tarea no Encontrada");
    return res.status(404).json({
      msg: error.message,
    });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción No Válida");
    return res.status(403).json({
      msg: error.message,
    });
  }
  return res.json({
    tarea,
  });
};
const actualizarTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate("proyecto");

  if (!tarea) {
    const error = new Error("Tarea no Encontrada");
    return res.status(404).json({
      msg: error.message,
    });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción No Válida");
    return res.status(403).json({
      msg: error.message,
    });
  }

  tarea.nombre = req.body.nombre || tarea.nombre;
  tarea.descripcion = req.body.descripcion || tarea.descripcion;
  tarea.prioridad = req.body.prioridad || tarea.prioridad;
  tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

  try {
    const tareaAlmacenada = await tarea.save();
    res.json(tareaAlmacenada);
  } catch (e) {
    console.log(e);
  }
};
const eliminarTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate("proyecto");

  if (!tarea) {
    const error = new Error("Tarea no Encontrada");
    return res.status(404).json({
      msg: error.message,
    });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción No Válida");
    return res.status(403).json({
      msg: error.message,
    });
  }

  try {
    const proyecto = await Proyecto.findById(tarea.proyecto);
    proyecto.tareas.pull(tarea._id);
    await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()]);
    res.json({ msg: "La Tarea ha sido Eliminada" });
  } catch (e) {
    console.log(e);
  }
};
const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id)
    .populate("proyecto")
    .populate("completado");

  if (!tarea) {
    const error = new Error("Tarea no Encontrada");
    return res.status(404).json({
      msg: error.message,
    });
  }

  if (
    tarea.proyecto.creador.toString() !== req.usuario._id.toString() &&
    !tarea.proyecto.colaboradores.some(
      (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
    )
  ) {
    const error = new Error("Acción no Válida");
    return res.status(401).json({ msg: error.message });
  }

  tarea.estado = !tarea.estado;
  tarea.completado = req.usuario._id;
  await tarea.save();

  const tareaAlmacenada = await Tarea.findById(id)
    .populate("proyecto")
    .populate("completado");

  res.json(tareaAlmacenada);
};

export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstado,
};

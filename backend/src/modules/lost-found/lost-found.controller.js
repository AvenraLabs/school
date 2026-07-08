import asyncHandler from "../../shared/asyncHandler.js";
import AppError from "../../shared/appError.js";
import {
  createLostFoundItem,
  getLostFoundItemById,
  listLostFoundItems,
  updateLostFoundStatus,
  deleteLostFoundItem,
} from "./lost-found.service.js";

export const createPost = asyncHandler(async (req, res) => {
  const item = await createLostFoundItem({
    school_id: req.user.school_id,
    created_by: req.user.id,
    ...req.body,
  });

  res.status(201).json({
    success: true,
    data: item,
  });
});

export const listItems = asyncHandler(async (req, res) => {
  const status = req.query.status || "OPEN";
  const type = req.query.type;
  const search = req.query.search;
  const limit = req.query.limit ? parseInt(req.query.limit) : 20;
  const offset = req.query.offset ? parseInt(req.query.offset) : 0;

  const result = await listLostFoundItems({
    school_id: req.user.school_id,
    status,
    type,
    search,
    limit,
    offset,
  });

  res.json({
    success: true,
    data: result.items,
    total: result.total,
  });
});

export const listMyItems = asyncHandler(async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 20;
  const offset = req.query.offset ? parseInt(req.query.offset) : 0;

  const result = await listLostFoundItems({
    school_id: req.user.school_id,
    created_by: req.user.id,
    status: null, // show all status
    limit,
    offset,
  });

  res.json({
    success: true,
    data: result.items,
    total: result.total,
  });
});

export const getItem = asyncHandler(async (req, res) => {
  const item = await getLostFoundItemById(req.params.id, req.user.school_id);
  if (!item) {
    throw new AppError("Item not found", 404);
  }

  res.json({
    success: true,
    data: item,
  });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const item = await getLostFoundItemById(req.params.id, req.user.school_id);
  
  if (!item) {
    throw new AppError("Item not found", 404);
  }

  // Check authorization: only owner or school_admin or super_admin
  const isOwner = String(item.created_by) === String(req.user.id);
  const isAdmin = ["school_admin", "super_admin"].includes(req.user.role);

  if (!isOwner && !isAdmin) {
    throw new AppError("You are not authorized to close this item", 403);
  }

  const updated = await updateLostFoundStatus(req.params.id, req.user.school_id, status);

  res.json({
    success: true,
    data: updated,
  });
});

export const deletePost = asyncHandler(async (req, res) => {
  const item = await getLostFoundItemById(req.params.id, req.user.school_id);
  
  if (!item) {
    throw new AppError("Item not found", 404);
  }

  const isOwner = String(item.created_by) === String(req.user.id);
  const isAdmin = ["school_admin", "super_admin"].includes(req.user.role);

  if (!isOwner && !isAdmin) {
    throw new AppError("You are not authorized to delete this post", 403);
  }

  await deleteLostFoundItem(req.params.id, req.user.school_id);

  res.json({
    success: true,
    message: "Item deleted successfully",
  });
});

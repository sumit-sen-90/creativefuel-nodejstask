const response = require("../config/response");
const { Validator } = require("node-input-validator");
const helper = require("../helper/hlp_common");
const task = require("../model/task");
const constant = require("../common/constant");

//------------------------------------------CREATE THE TASK

exports.createTask = async (req, res) => {
  const postData = req.body;
  postData.attachmentFile = req.file?.filename;
  const userId = helper.loginUserId(req.headers.authorization);
  try {
    let validation = new Validator(postData, {
      title: "required|string",
      attachmentFile: "required",
      due_date: "required|dateFormat:YYYY-MM-DD",
    });
    let matched = await validation.check();
    if (!matched) {
      return response.returnFalse(
        req,
        res,
        helper.validationErrorConvertor(validation),
        {}
      );
    }
    if (!helper.checkValidDate(postData.due_date)) {
      return response.returnFalse(req, res, constant.PROVIDE_VALID_DATE, {});
    }
    postData.due_date = helper.convertIntoTimeStamp(postData.due_date);
    postData.createdBy = userId;
    const taskInfo = new task(postData);
    const savedTaskInfo = await taskInfo.save();

    if (savedTaskInfo) {
      return response.returnTrue(
        req,
        res,
        constant.TASK_CREATED,
        savedTaskInfo
      );
    } else {
      return response.returnFalse(req, res, constant.OOPS_TRY_AGAIN, {});
    }
  } catch (error) {
    console.error("Error create task:", error);
    return response.returnFalse(req, res, constant.INTERNAL_ERROR, {});
  }
};

//------------------------------------------GET ALL THE TASKS

exports.getAllTask = async (req, res) => {
  const userId = helper.loginUserId(req.headers.authorization);
  try {
    const taskData = await task.find({ createdBy: userId });
    if (taskData.length > 0) {
      return response.returnTrue(req, res, constant.FETCHING_SUCCESS, taskData);
    } else {
      return response.returnFalse(req, res, constant.NO_RECORD, {});
    }
  } catch (error) {
    console.error("Error list task:", error);
    return response.returnFalse(req, res, constant.INTERNAL_ERROR, {});
  }
};

//------------------------------------------UPDATE THE TASK INFORMATION

exports.updateTask = async (req, res) => {
  try {
    const { due_date, title } = req.body;
    const id = req.params.id;
    const attachmentFile = req.file?.filename;

    const updateInfo = {};

    const validation = new Validator(req.body, {
      title: "string",
      due_date: "dateFormat:YYYY-MM-DD",
    });

    const isValid = await validation.check();
    if (!isValid) {
      return response.returnFalse(
        req,
        res,
        helper.validationErrorConvertor(validation),
        {}
      );
    }

    if (due_date) {
      if (!helper.checkValidDate(due_date)) {
        return response.returnFalse(req, res, constant.PROVIDE_VALID_DATE, {});
      }
      updateInfo.due_date = helper.convertIntoTimeStamp(due_date);
    }

    if (title) {
      updateInfo.title = title;
    }

    if (attachmentFile) {
      updateInfo.attachmentFile = attachmentFile;
    }

    await task.updateOne({ _id: id }, { $set: updateInfo });
    return response.returnTrue(req, res, constant.UPDATE_SUCCESS, {});
  } catch (error) {
    console.error("Error updating task:", error);
    return response.returnFalse(req, res, constant.INTERNAL_ERROR, {});
  }
};

//------------------------------------------DELTE THE TASK FROM DB ( HARD DELETE )

exports.deleteTask = async (req, res) => {
  try {
    await task.findByIdAndDelete(req.params.id);
    return response.returnTrue(req, res, constant.DELETION_SUCCESS);
  } catch (error) {
    console.error("Error Delete task:", error);
    return response.returnFalse(req, res, constant.INTERNAL_ERROR, {});
  }
};

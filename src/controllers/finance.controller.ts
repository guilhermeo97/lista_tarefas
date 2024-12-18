import financeService from "../services/finance.service";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/apperror";
import CreateFinanceDTO from "../dto/createfinancedto";
import { validate } from "class-validator";
import DisplayFinanceDTO from "../dto/displayfinancedto";
import ModifyinanceDTO from "../dto/modifyfinancedto";
import { DisplayUserDTO } from "../dto/displayuserdto";
class FinanceController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { description, ocurenceDate, typeValue, money } = req.body;
      const email = req.user.email;

      if (!email) {
        throw new AppError("Acesso negado", 401);
      }

      const dto = new CreateFinanceDTO(
        description.trim(),
        ocurenceDate,
        typeValue,
        money
      );
      const errors = await validate(dto);

      if (errors.length > 0) {
        return next(errors);
      }

      const newFinance = await financeService.create(dto, email);
      if (!newFinance) {
        throw new AppError("Erro ao criar finance", 400);
      }
      res.status(201).json(newFinance);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = req.user.email;
      const financeId = +req.params.userId;

      if (!email) {
        throw new AppError("Acesso negado", 401);
      }

      if (!financeId) {
        throw new AppError("Finança não informado", 400);
      }
      const deleteFinance = await financeService.delete(financeId, email);
      if (!deleteFinance) {
        throw new AppError("Finança não encontrada!", 404);
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async findAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const email = req.user.email;
      if (!email) {
        throw new AppError("Acesso negado!", 401);
      }
      const findFinances = await financeService.findAllByUser(email);
      if (!findFinances) {
        throw new AppError("Finanças não encontradas", 404);
      }
      res.status(200).json(findFinances);
    } catch (err) {
      next(err);
    }
  }

  async modifyOneFinance(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const financeId = +req.params.id;
      const email = req.user.email;
      if (!email) {
        throw new AppError("Acesso negado!", 401);
      }
      if (!financeId) {
        throw new AppError("Finança não informada", 400);
      }
      const { description, ocurenceDate, typeValue, money } = req.body;
      const dto = new ModifyinanceDTO(
        description,
        ocurenceDate,
        typeValue,
        money
      );
      const updateFinance = await financeService.modifyOneFinance(
        financeId,
        dto,
        email
      );
      if (!updateFinance) {
        throw new AppError("Finança não encontrada", 404);
      }
      res.status(200).json(updateFinance);
    } catch (err) {
      next(err);
    }
  }

  async findOneFinance(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const financeId = +req.params.id;
      const email = req.user.email;
      if (!financeId || !email) {
        throw new AppError("Acesso negado!", 401);
      }

      const findOneFinance = await financeService.findOne(financeId);
      if (!findOneFinance) {
        throw new AppError("Finança não encontrada", 404);
      }
      const user = new DisplayUserDTO(
        findOneFinance.user.name,
        findOneFinance.user.email
      );
      const finance = new DisplayFinanceDTO(
        findOneFinance.description,
        findOneFinance.ocurenceDate,
        findOneFinance.typeValue,
        findOneFinance.money,
        user
      );
      res.status(200).json(finance);
    } catch (err) {
      next(err);
    }
  }
}

export default new FinanceController();

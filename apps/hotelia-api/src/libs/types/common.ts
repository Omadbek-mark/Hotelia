import { ObjectId, Types } from "mongoose";

export interface T {
  [ke: string]: any;
}

export interface StatisticModifier {
  _id: ObjectId | Types.ObjectId;
  targetKey: string;
  modifier: number;
}
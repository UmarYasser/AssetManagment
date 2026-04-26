import { PartialType } from "@nestjs/mapped-types";
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from "class-validator";
import CreateAssetDTO from "./create-asset.dto";

export class EditAssetDTO extends PartialType(CreateAssetDTO){}
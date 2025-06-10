from typing import Any, List, Optional

from pydantic import BaseModel, Field


class TargetCell(BaseModel):
    row_id: str
    column_id: str = Field(alias="col_id")


class Column(BaseModel):
    id: str
    header: str = Field(alias="label")
    width: Optional[int] = None


class CalculationRequest(BaseModel):
    formula: str
    target_cell: TargetCell
    columns: List[Column]
    data: List[dict[str, Any]]


class CalculationResponse(BaseModel):
    result: Any 

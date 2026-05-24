from pydantic import BaseModel


class AgentOut(BaseModel):
    id: str
    email: str
    name: str

    model_config = {"from_attributes": True}

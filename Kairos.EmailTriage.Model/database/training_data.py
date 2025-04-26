import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


class TrainingDataLoader:
    def __init__(self):
        self.server_name = 'MSI\\SQLEXPRESS'
        self.database_name = 'EmailTriageDb-v02'
        self.database_table = 'TrainingDatas'
        self.driver_name = 'ODBC+Driver+17+for+SQL+Server'
        self.database_uri = f'mssql+pyodbc://@{self.server_name}/{self.database_name}?driver={self.driver_name}&Trusted_Connection=yes&TrustServerCertificate=yes'
        self.engine = create_engine(self.database_uri)

    def load_training_data(self):
        session = sessionmaker(bind=self.engine)()
        try:
            df = pd.read_sql(f"SELECT TextColumn, LabelColumn FROM {self.database_table}", self.engine)
        finally:
            session.close()
            self.engine.dispose()
        return df
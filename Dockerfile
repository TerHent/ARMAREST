FROM python:3.11
RUN  python --version

# Create app directory
WORKDIR /app

# copy requirements.txt
COPY backend/requirements.txt ./

# Install app dependencies
RUN pip install -r requirements.txt

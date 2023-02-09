FROM python:3.10

LABEL MAINTAINER="WillDrug"

# Create app directory
WORKDIR /app

#COPY src/toycommons/requirements.txt ./
#RUN pip install -r requirements.txt

# Install app dependencies
COPY ./requirements.txt ./
RUN pip install -r requirements.txt

# Bundle app source
COPY src ./
CMD ["gunicorn", "-w",  "4", "-b", "0.0.0.0:80", "main:app"]
FROM python:3.9-slim

WORKDIR /usr/src/app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
# uncomment if container has UI
# RUN mkdir templates
# COPY templates ./templates

#uncomment if container has js scripts
# RUN mkdir static
# COPY static ./static

#ARG DBUSERNAME 

#ENV DBUSERNAME $DBUSERNAME

#ENV DBUSERNAME $DBUSERNAME

#COPY ./db_models.py .
COPY ./app.py .
COPY ./functions.py .



# command for local container
#CMD ["python", "app.py"]

# command for container hosted on cloud run
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app
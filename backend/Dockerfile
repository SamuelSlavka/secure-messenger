FROM python:3.6
#RUN apt-get update

COPY ./requirements.txt /tmp/requirements.txt
WORKDIR /tmp
RUN pip3 install -r requirements.txt

#copy app
COPY . /src
WORKDIR /

CMD ["gunicorn", "-w", "5", "-b", ":5000", "-t", "360", "--reload", "src.src.wsgi:app"]
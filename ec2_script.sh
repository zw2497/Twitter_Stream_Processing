wget https://repo.anaconda.com/archive/Anaconda3-2019.03-Linux-x86_64.sh
wget http://www.trieuvan.com/apache/kafka/2.2.0/kafka_2.12-2.2.0.tgz
chmod +x Anaconda3-2019.03-Linux-x86_64.sh
./Anaconda3-2019.03-Linux-x86_64.sh
bash
conda create --name py36 python=3.6
conda activate py36
conda install jupyter
pip install kafka-python
tar -xzf kafka_2.12-2.2.0.tgz
cd kafka_2.12-2.2.0

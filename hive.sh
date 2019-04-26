#install jdk1.8
#install hadoop
#install hive

#append in .bashrc
export HADOOP_CONF_DIR=/home/bs3113/hadoop-2.8.5/etc/hadoop
export JAVA_HOME=/opt/jdk1.8.0_211


export HADOOP_HOME=/home/bs3113/hadoop-2.8.5
export HADOOP_INSTALL=$HADOOP_HOME
export HADOOP_MAPRED_HOME=$HADOOP_HOME
export HADOOP_COMMON_HOME=$HADOOP_HOME
export HADOOP_HDFS_HOME=$HADOOP_HOME
export YARN_HOME=$HADOOP_HOME
export HADOOP_COMMON_LIB_NATIVE_DIR=$HADOOP_HOME/lib/native
export PATH=$PATH:$HADOOP_HOME/sbin:$HADOOP_HOME/bin
export HADOOP_OPTS="-Djava.library.path=$HADOOP_HOME/lib/native"



export HIVE_HOME=/home/bs3113/apache-hive-2.3.4-bin
export PATH=$PATH:$HIVE_HOME/bin
export CLASSPATH=$CLASSPATH:/home/bs3113/hadoop-2.8.5/lib/*:.
export CLASSPATH=$CLASSPATH:/home/bs3113/apache-hive-2.3.4-bin/lib/*:.

export DERBY_HOME=/home/bs3113/db-derby-10.4.2.0-bin
export PATH=$PATH:$DERBY_HOME/bin
export CLASSPATH=$CLASSPATH:$DERBY_HOME/lib/derby.jar:$DERBY_HOME/lib/derbytools.jar

#run hive 
hive --service hiveserver2 --hiveconf hive.server2.thrift.port=10000 --hiveconf hive.root.logger=INFO,console

#for hiveserver2 not starting
cd $HIVE_HOME/scripts/metastore/upgrade/mysql/
rm -rf metastore_db/

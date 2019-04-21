import java.util.*;

import org.apache.kafka.clients.producer.Callback;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.apache.spark.SparkConf;
import org.apache.spark.TaskContext;
import org.apache.spark.api.java.*;
import org.apache.spark.api.java.function.*;
import org.apache.spark.streaming.Durations;
import org.apache.spark.streaming.Seconds;
import org.apache.spark.streaming.StreamingContext;
import org.apache.spark.streaming.api.java.*;
import org.apache.spark.streaming.kafka010.*;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.apache.kafka.common.serialization.StringSerializer;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import scala.Tuple2;


public class Spark2Kafka {
    public static void main(String[] args) throws Exception {
        Logger.getLogger("org.apache").setLevel(Level.ERROR);

        SparkConf conf = new SparkConf().setMaster("local[2]").setAppName("KafkaDemo");
        JavaStreamingContext streamingContext = new JavaStreamingContext(conf, Durations.seconds(1));

        Map<String, Object> kafkaParams = new HashMap<>();
        kafkaParams.put("bootstrap.servers", "18.216.34.97:9092");
        kafkaParams.put("key.deserializer", StringDeserializer.class);
        kafkaParams.put("value.deserializer", StringDeserializer.class);
        kafkaParams.put("group.id", "group12345");
        kafkaParams.put("auto.offset.reset", "earliest");
        kafkaParams.put("enable.auto.commit", false);

        Collection<String> topics = Arrays.asList("sks-1");

        JavaInputDStream<ConsumerRecord<String, String>> stream =
                KafkaUtils.createDirectStream(
                        streamingContext,
                        LocationStrategies.PreferConsistent(),
                        ConsumerStrategies.<String, String>Subscribe(topics, kafkaParams)
                );


        JavaDStream fStream = stream.filter(cr -> {
            JSONObject fJson = extractAttr(cr);
            JSONObject entityJObject = (JSONObject)fJson.get("entities");
            JSONArray hashTagsJArray = (JSONArray) entityJObject.get("hashtags");
            return !hashTagsJArray.isEmpty();
        });


//        JavaPairDStream<String, Integer> pairs = fStream.mapToPair((PairFunction<ConsumerRecord<String, String>, String, Integer>) cr -> {
//            JSONObject fJson = extractAttr(cr);
//            JSONObject entityJObject = (JSONObject)fJson.get("entities");
//            JSONArray hashTagsJArray = (JSONArray) entityJObject.get("hashtags");
//            return new Tuple2<>(hashTagsJArray.toString(), 1);
//        });

        @SuppressWarnings("unchecked")
        JavaPairDStream<String, Integer> pairs = fStream.flatMapToPair((PairFlatMapFunction<ConsumerRecord<String, String>, String, Integer>) cr -> {
            JSONObject fJson = extractAttr(cr);
            JSONObject entityJObject = (JSONObject) fJson.get("entities");
            JSONArray hashTagsJArray = (JSONArray) entityJObject.get("hashtags");

            ArrayList<Tuple2<String, Integer>> list = new ArrayList<>();
            for (Object obj : hashTagsJArray) {
                JSONObject jObj = (JSONObject) obj;
                Tuple2<String, Integer> tuple2 = new Tuple2<>(jObj.get("text").toString(), 1);
                list.add(tuple2);
            }
            return list.iterator();
        });

        JavaPairDStream<String, Integer> wordCounts = pairs.reduceByKey((i1, i2) -> i1 + i2);
//        JavaPairDStream<String, Integer> wordCounts = pairs.reduceByKeyAndWindow((i1, i2) -> i1 + i2, Durations.seconds(3), Durations.seconds(1));


        // Streaming start
        wordCounts.foreachRDD(record -> {
            if (record.count() > 0) {
                record.foreach(f -> {
                    // Kafka producer
                    Properties kafkaProps = new Properties();
                    kafkaProps.put("bootstrap.servers", "18.216.34.97:9092");
                    kafkaProps.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
                    kafkaProps.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");
                    KafkaProducer<String, String> producer = new KafkaProducer<String, String>(kafkaProps);
                    ProducerRecord<String, String> pr = new ProducerRecord<String, String>("caiji3", f._1, f._2.toString());
                    producer.send(pr, new DemoProducerCallback());
                    producer.close();

                    System.out.println(f.toString());
                });
            }
        });

//        wordCounts.print();

        streamingContext.start();
        streamingContext.awaitTermination();
    }

    private static class DemoProducerCallback implements Callback {
        @Override
        public void onCompletion(RecordMetadata recordMetadata, Exception e) {
            if (e != null) {
                e.printStackTrace();
            }
        }
    }

    private static JSONObject extractAttr(ConsumerRecord<String, String> cr) {
        String crStr = cr.value();
        JSONParser parser = new JSONParser();
        JSONObject fJson = null;
        try {
            fJson = (JSONObject) parser.parse(crStr);
        } catch (ParseException e) {
            e.printStackTrace();
        }

        return fJson;
    }
}

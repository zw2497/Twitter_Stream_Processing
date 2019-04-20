import java.util.*;

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

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import scala.Tuple2;


public class Spark2Kafka {
    public static void main(String[] args) {
        SparkConf conf = new SparkConf().setMaster("local[2]").setAppName("KafkaDemo");
        JavaStreamingContext streamingContext = new JavaStreamingContext(conf, Durations.seconds(1));


        Map<String, Object> kafkaParams = new HashMap<>();
        kafkaParams.put("bootstrap.servers", "18.216.34.97:9092");
        kafkaParams.put("key.deserializer", StringDeserializer.class);
        kafkaParams.put("value.deserializer", StringDeserializer.class);
        kafkaParams.put("group.id", "group123");
        kafkaParams.put("auto.offset.reset", "earliest");
        kafkaParams.put("enable.auto.commit", false);

        Collection<String> topics = Arrays.asList("javaTest3");

        JavaInputDStream<ConsumerRecord<String, String>> stream =
                KafkaUtils.createDirectStream(
                        streamingContext,
                        LocationStrategies.PreferConsistent(),
                        ConsumerStrategies.<String, String>Subscribe(topics, kafkaParams)
                );


        JavaDStream fStream = stream.filter(cr -> {
            JSONObject fJson = extractAttr(cr);
            return !fJson.get("data").toString().equals("a");
        });

        JavaPairDStream<String, Integer> pairs = fStream.mapToPair((PairFunction<ConsumerRecord<String, String>, String, Integer>) cr -> {
            JSONObject fJson = extractAttr(cr);
            return new Tuple2<>(fJson.get("data").toString(), 1);
        });

        JavaPairDStream<String, Integer> wordCounts = pairs.reduceByKey((i1, i2) -> i1 + i2);

        try {
//            stream.foreachRDD(record -> {
//                if (record.count() > 0) {
//                    record.foreach(f -> {
//                        String fVal = f.value();
//                        JSONParser parser = new JSONParser();
//                        JSONObject fJson = (JSONObject) parser.parse(fVal) ;
//                        System.out.println(fJson);
//                    });
//                }
//            });

            wordCounts.print();
            streamingContext.start();
            streamingContext.awaitTermination();
        } catch (Exception e) {
            e.printStackTrace();
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

package br.com.ifsp.classify.utils;

import java.nio.ByteBuffer;
import java.util.List;
import java.util.UUID;

public class Utils {

    public static boolean isNullOrEmpty(String word) {
        return word == null || word.trim().isEmpty();
    }

    public static boolean isNullOrEmpty(List<Object> list) {
        return list == null || list.isEmpty();
    }

    public static UUID convertBytesToUUID(Byte[] bytes) {
        byte[] primitive = new byte[bytes.length];

        for (int i = 0; i < bytes.length; i++) {
            primitive[i] = bytes[i]; // unboxing
        }

        ByteBuffer byteBuffer = ByteBuffer.wrap(primitive);
        long high = byteBuffer.getLong();
        long low = byteBuffer.getLong();

        return new UUID(high, low);
    }

    public static Byte[] convertUUIDToBytes(UUID uuid) {
        ByteBuffer bb = ByteBuffer.wrap(new byte[16]);
        bb.putLong(uuid.getMostSignificantBits());
        bb.putLong(uuid.getLeastSignificantBits());
        return toObject(bb.array());
    }

    private static Byte[] toObject(byte[] bytes) {
        Byte[] result = new Byte[bytes.length];
        for (int i = 0; i < bytes.length; i++) {
            result[i] = bytes[i];
        }
        return result;
    }
}
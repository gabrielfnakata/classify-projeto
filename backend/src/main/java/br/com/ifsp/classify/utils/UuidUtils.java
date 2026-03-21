package br.com.ifsp.classify.utils;

import java.nio.ByteBuffer;
import java.util.UUID;

public class UuidUtils {

    public static byte[] generateUUID() {
        return convertUUIDToBytes(UUID.randomUUID());
    }

    public static String convertBytesToString(byte[] bytes) {
        ByteBuffer bb = ByteBuffer.wrap(bytes);
        long high = bb.getLong();
        long low = bb.getLong();

        return new UUID(high, low).toString();
    }

    public static byte[] convertUUIDToBytes(String uuid) {
        return convertUUIDToBytes(UUID.fromString(uuid.trim()));
    }

    private static byte[] convertUUIDToBytes(UUID uuid) {
        ByteBuffer bb = ByteBuffer.wrap(new byte[16]);
        bb.putLong(uuid.getMostSignificantBits());
        bb.putLong(uuid.getLeastSignificantBits());

        return bb.array();
    }
}
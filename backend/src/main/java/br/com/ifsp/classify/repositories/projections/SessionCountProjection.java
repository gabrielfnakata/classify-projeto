package br.com.ifsp.classify.repositories.projections;

/** Linha das contagens agregadas: a chave do agrupamento em bytes e os dois totais. */
public interface SessionCountProjection {

    byte[] getKey();

    long getUpcoming();

    long getToday();
}

package webApp;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import survey.Survey;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/*
 * A database for surveys
 */
@RepositoryRestResource(collectionResourceRel = "survey", path = "survey")
public interface SurveyRepository extends PagingAndSortingRepository<Survey, Integer> {
    Optional<Survey> findByLink(@Param("link") UUID link);
    List<Survey> findByName(@Param("name") String name);

    @Query(value = "SELECT * FROM Survey ORDER BY name", nativeQuery = true)
    List<Survey> findAllSorted();
}

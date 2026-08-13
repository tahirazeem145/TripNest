package com.tripnest.repository;

import com.tripnest.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link Profile}.
 *
 * Phase 2: Basic lookup methods only.
 * Business logic will be added in Phase 3 (Profile REST API).
 */
@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    /** Find a profile by email address (case-sensitive). */
    Optional<Profile> findByEmail(String email);

    /** Batch-fetch profiles by a list of IDs (used when joining posts → authors). */
    List<Profile> findAllByIdIn(List<UUID> ids);

    /** Find all profiles with a given role ('USER' or 'ADMIN'). */
    List<Profile> findAllByRole(String role);
}

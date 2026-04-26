package com.shiguangyuan.timemaster.repository;

import com.shiguangyuan.timemaster.model.entity.Pomodoro;
import com.shiguangyuan.timemaster.model.entity.Task;
import com.shiguangyuan.timemaster.model.enums.PomodoroType;
import com.shiguangyuan.timemaster.model.enums.SyncStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PomodoroRepository extends JpaRepository<Pomodoro, String> {
    Page<Pomodoro> findByUserUserIdOrderByStartTimeDesc(String userId, Pageable pageable);
    List<Pomodoro> findByUserUserIdAndStartTimeBetween(String userId, LocalDateTime start, LocalDateTime end);
    List<Pomodoro> findByUserUserIdAndStartTimeBetweenAndType(String userId, LocalDateTime start, LocalDateTime end, PomodoroType type);
    List<Pomodoro> findByUserUserIdAndSyncStatus(String userId, SyncStatus syncStatus);
    long countByUserUserIdAndStartTimeBetween(String userId, LocalDateTime start, LocalDateTime end);
    List<Pomodoro> findByTask(Task task);

    @Query("SELECT COALESCE(SUM(p.duration), 0) FROM Pomodoro p WHERE p.user.userId = :userId AND p.startTime BETWEEN :start AND :end AND p.type = 'FOCUS' AND p.isInterrupted = false")
    long sumFocusDurationByUserIdAndPeriod(@Param("userId") String userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}

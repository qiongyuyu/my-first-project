package com.shiguangyuan.timemaster.repository;

import com.shiguangyuan.timemaster.model.entity.Task;
import com.shiguangyuan.timemaster.model.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, String> {
    Page<Task> findByUserUserId(String userId, Pageable pageable);
    Page<Task> findByUserUserIdAndStatus(String userId, TaskStatus status, Pageable pageable);
    Page<Task> findByUserUserIdAndPriority(String userId, String priority, Pageable pageable);
    long countByUserUserIdAndStatus(String userId, TaskStatus status);
    long countByUserUserId(String userId);
}

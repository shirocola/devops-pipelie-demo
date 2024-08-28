package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class HelloWorldControllerTest {

    @Test
    public void testHello() {
        HelloWorldController controller = new HelloWorldController();
        String result = controller.hello();
        assertThat(result).isEqualTo("Hello, World!");
    }
}

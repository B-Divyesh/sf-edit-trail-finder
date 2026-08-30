#define _GNU_SOURCE

#include <errno.h>
#include <fcntl.h>
#include <netdb.h>
#include <stddef.h>
#include <stdlib.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <unistd.h>

static void record_attempt(const char *operation) {
    const char *path = getenv("EDIT_TRAIL_NETWORK_LOG");
    if (path == NULL) return;
    int descriptor = open(path, O_WRONLY | O_CREAT | O_APPEND, 0600);
    if (descriptor < 0) return;
    size_t length = 0;
    while (operation[length] != '\0') length++;
    (void)write(descriptor, operation, length);
    (void)write(descriptor, "\n", 1);
    (void)close(descriptor);
}

int connect(int socket, const struct sockaddr *address, socklen_t length) {
    (void)socket;
    (void)address;
    (void)length;
    record_attempt("connect");
    errno = EPERM;
    return -1;
}

ssize_t sendto(int socket, const void *buffer, size_t length, int flags,
               const struct sockaddr *address, socklen_t address_length) {
    (void)socket;
    (void)buffer;
    (void)length;
    (void)flags;
    (void)address;
    (void)address_length;
    record_attempt("sendto");
    errno = EPERM;
    return -1;
}

ssize_t sendmsg(int socket, const struct msghdr *message, int flags) {
    (void)socket;
    (void)message;
    (void)flags;
    record_attempt("sendmsg");
    errno = EPERM;
    return -1;
}

int getaddrinfo(const char *node, const char *service,
                const struct addrinfo *hints, struct addrinfo **result) {
    (void)node;
    (void)service;
    (void)hints;
    (void)result;
    record_attempt("getaddrinfo");
    return EAI_FAIL;
}
